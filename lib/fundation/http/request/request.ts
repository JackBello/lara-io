// deno-lint-ignore-file no-explicit-any no-inferrable-types
import { IConnectionInfo } from '../../../@types/interfaces/server.interface.ts';
import { IRoute } from '../../../@types/interfaces/router.interface.ts';
import { UploadedFile } from '../uploaded-file.ts';
import { conversionXMLtoJSON, Streams, Mime } from '../../../dep.ts';

const { readerFromStreamReader } = Streams

const { parse } = conversionXMLtoJSON;

const { MultipartReader } = Mime;

export class HttpRequest {
    private __conection?: IConnectionInfo;
    private __request?: Request;
    private __session?: any;
    private __params?: any;
    private __route?: IRoute;
    private __user?: any;

    private $body: any = null;
    private $headers: Record<string, string> = {};
    private $files: Record<string, UploadedFile> = {};
    private $route?: IRoute = undefined;
    private $params: any = {};
    private $query: any = {};
    private $method: string = "";
    private $baseUrl: string = "";
    private $baseUri: string = "";
    private $fullUrl: string = "";
    private $ip: string = "";

    public async serialize() {
        const { body, files } = await this.getBodyResponse();

        this.$body = body;
        this.$files = files;
        this.$headers = this.getHeaders();
        this.$route = this.getRoute();
        this.$params = this.getParams();
        this.$query = this.getQuery();
        this.$method = this.getMethod();
        this.$baseUrl = this.getUrl();
        this.$baseUri = this.getUri();
        this.$fullUrl = this.getFullUrl();
        this.$ip = this.getIp();
    }

    public setConnection(connection: IConnectionInfo) {
        this.__conection = connection;
    }

    public setRequest(request: Request) {
        this.__request = request;
    }

    public setSession(session: any) {
        this.__session = session;
    }

    public setParams(params: any) {
        this.__params = params;
    }

    public setRoute(route: IRoute) {
        this.__route = route;
    }

    public setUser(user: any) {
        this.__user = user;
    }

    private getIp() {
        if (!this.__conection) throw new Error("ConnectionInfo not found");

        const { hostname } = this.__conection.remoteAddr as Deno.NetAddr;

        return hostname;
    }

    private getMethod() {
        if (!this.__request) throw new Error("Request not found");
        
        return this.__request.method;
    }

    private getRoute() {
        if (!this.__route) throw new Error("Route not found");

        return this.__route;
    }

    private getParams() {
        if (!this.__params) throw new Error("Params not found");

        return this.__params;
    }

    private getFullUrl() {
        if (!this.__request) throw new Error("Request not found");

        return this.__request.url;
    }

    private getUrl() {
        if (!this.__request) throw new Error("Request not found");

        const urlPattern: URLPattern = new URLPattern(this.__request.url);

        return `${urlPattern.protocol}//${urlPattern.hostname}`;
    }

    private getUri() {
        if (!this.__request) throw new Error("Request not found");

        const urlPattern: URLPattern = new URLPattern(this.__request.url);

        return urlPattern.pathname;
    }

    private getQuery() {
        if (!this.__request) throw new Error("Request not found");

        const urlPattern: URLPattern = new URLPattern(this.__request.url);

        const searchParams = new URLSearchParams(urlPattern.search);

        const query: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            query[key] = value;
        });

        return query;
    }

    private getHeaders() {
        if (!this.__request) throw new Error("Request not found");

        const headers: Record<string, string> = {};

        this.__request.headers.forEach((value, key) => {
            headers[key] = value;
        });

        return headers;
    }

    private async getBodyResponse() {
        if (!this.__request) throw new Error("Request not found");

        const contentType = this.getHeaders()["content-type"];
        const json: any = {};
        const files: any = {};

        if (!contentType) {
            return {
                body: null,
                files: null
            };
        }

        if (contentType.startsWith("application/xml")) {
            try {
                return {
                    body: parse(await this.__request.text()),
                    files
                }
            } catch  {
                return {
                    body: null,
                    files
                };
            }
        } else if (contentType.startsWith("application/json")) {
            try {
                return {
                    body: await this.__request.json(),
                    files
                }
            } catch {
                return {
                    body: null,
                    files
                };
            }
        } else if (contentType.startsWith("multipart/form-data")) {
            try {
                const body = this.__request.body;

                if (!body) {
                    return {
                        body: null,
                        files
                    }
                }

                const boundary = contentType.split(";")[1].split("=")[1];
                const reader = readerFromStreamReader(body.getReader());
                const multipart = new MultipartReader(reader, boundary);
                const form = await multipart.readForm({
                    dir: "./src/storage/tmp",
                    prefix: `tpm-${Date.now()}-`
                });

                for (const entry of form.entries()) {
                    const [key, value] = entry;

                    if (value) {
                        if  (typeof value[0] === "string") {
                            json[key] = value[0];
                        } else {
                            const path = `${Deno.cwd()}/src/storage/tmp/`;

                            if (value[0].content && !value[0].tempfile) {
                                files[key] = new UploadedFile(value[0].content, value[0].filename, value[0].size, value[0].type, undefined, undefined);
                            } else {
                                files[key] = new UploadedFile(undefined, value[0].filename, value[0].size, value[0].type, path, value[0].tempfile?.replace("./src/storage/tmp\\", ""));
                            }
                        }
                    }
                }

                return {
                    body: json,
                    files
                };
            } catch {
                return {
                    body: null,
                    files
                };
            }
        } else if (contentType.startsWith("application/x-www-form-urlencoded")) {
            try {
                (await this.__request.formData()).forEach((value, key) => {
                    json[key] = value;
                });
                
                return {
                    body: json,
                    files
                };
            } catch {
                return {
                    body: null,
                    files
                };
            }
        } else {
            return {
                body: null,
                files
            }
        }
    }

    get body() {
        return this.$body;
    }

    get files() {
        return this.$files;
    }

    get headers() {
        return this.$headers;
    }

    get route() {
        return this.$route;
    }

    get params() {
        return this.$params;
    }

    get query() {
        return this.$query;
    }

    get method() {
        return this.$method;
    }

    get baseUrl() {
        return this.$baseUrl;
    }

    get baseUri() {
        return this.$baseUri;
    }

    get fullUrl() {
        return this.$fullUrl;
    }
    
    get ip() {
        return this.$ip;
    }
}