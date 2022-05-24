// deno-lint-ignore-file no-explicit-any no-inferrable-types
import { IConnectionInfo } from '../../../@types/server.ts';
import { IRoute } from '../../../@types/route.ts';
import { HttpUploadedFile } from '../http-uploaded-file.ts';
import { conversionXML, conversionYAML, Streams, Mime, Cookies } from '../../../dep.ts';

const { readerFromStreamReader } = Streams

const { parse } = conversionXML;
const { parseYAML } = conversionYAML;

const { MultipartReader } = Mime;

const { getCookies } = Cookies;

export class HttpRequest {
    [index: string]: any;

    private __conection?: IConnectionInfo;
    private __request?: Request;
    private __session?: any;
    private __params?: any;
    private __route?: IRoute;
    private __user?: any;

    private $body: any = null;
    private $headers: Record<string, string> = {};
    private $files: Record<string, HttpUploadedFile> = {};
    private $cookies: Record<string, string> = {};
    private $route?: IRoute = undefined;
    private $params: any = {};
    private $query: any = {};
    private $method: string = "";
    private $baseUrl: string = "";
    private $baseUri: string = "";
    private $fullUrl: string = "";
    private $ip: string = "";
    private $bearerToken: string = "";
    private $accepts: string[] = [];
    private $subdomain: string = "";
    private $protocol: string = "";
    private $languages: string[] = [];

    public async serialize() {
        const { body, files } = await this.getBodyResponse();

        if (body) this.mergeBodyWithRequest(body);
        if (files) this.mergeFilesWithRequest(files);

        this.$accepts = this.getAccepts();
        this.$bearerToken = this.getBearerToken();
        this.$body = body;
        this.$files = files;
        this.$cookies = this.getCookies();
        this.$headers = this.getHeaders();
        this.$route = this.getRoute();
        this.$params = this.getParams();
        this.$query = this.getQuery();
        this.$method = this.getMethod();
        this.$baseUrl = this.getUrl();
        this.$baseUri = this.getUri();
        this.$fullUrl = this.getFullUrl();
        this.$ip = this.getIp();
        this.$subdomain = this.getSubdomain();
        this.$protocol = this.getProtocol();
        this.$languages = this.getLanguages();
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

    private mergeFilesWithRequest(files: Record<string, HttpUploadedFile>) {
        for (const key in files) {
            this[key] = files[key];
        }
    }

    private mergeBodyWithRequest(body: any) {
        for (const key in body) {
            this[key] = body[key];
        }
    }

    private getLanguages() {
        const acceptLanguage = this.headers["accept-language"];

        if (!acceptLanguage) return [];

        const languages = acceptLanguage.split(",");

        return languages;
    }

    private getProtocol() {
        if (!this.__request) throw new Error("Request not found");

        const urlPattern: URLPattern = new URLPattern(this.__request.url);

        return urlPattern.protocol;
    }

    private getSubdomain() {
        if (!this.__route) throw new Error("Route not found");

        return this.route?.domain ? this.route.domain : "";
    }

    private getCookies() {
        if (!this.__request) throw new Error("Request not found");

        return getCookies(this.__request.headers);
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

        if (contentType.startsWith("text/plain")) {
            try {
                return {
                    body: await this.__request.text(),
                    files
                }
            } catch  {
                return {
                    body: null,
                    files
                };
            }
        } else if (contentType.startsWith("application/xml")) {
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
        } else if (contentType.startsWith("text/yaml")) {
            try {
                return {
                    body: parseYAML(await this.__request.text()),
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
                                files[key] = new HttpUploadedFile(value[0].content, value[0].filename, value[0].size, value[0].type, undefined, undefined);
                            } else {
                                files[key] = new HttpUploadedFile(undefined, value[0].filename, value[0].size, value[0].type, path, value[0].tempfile?.replace("./src/storage/tmp\\", ""));
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

    private getBearerToken() {
        const authorization = this.headers["authorization"];

        if (!authorization) return "";

        const token = authorization.split(" ")[1];

        return token;
    }

    private getAccepts() {
        const accept = this.headers["accept"];

        if (!accept) return [];

        return accept.split(",");
    }

    public isMethod(method: string) {
        return this.method === method.toLocaleUpperCase();
    }

    public hasHeader(key: string) {
        return this.headers[key] !== undefined;
    }

    public hasAccepts(contentType: string) {
        return this.accepts.includes(contentType);
    }

    public hasLanguage(language: string) {
        return this.languages.includes(language);
    }

    public hasBody(key: string) {
        return this.body[key] !== undefined;
    }

    public hasQuery(key: string) {
        return this.query[key] !== undefined;
    }

    public hasFiles(key: string) {
        return this.files[key] !== undefined;
    }

    public hasParam(key: string) {
        return this.params[key] !== undefined;
    }

    public getInputBody(key?: string, defaultValue?: any) {
        if (key) return this.body[key] ?? defaultValue;
        return this.body;
    }

    public getInputQuery(key?: string, defaultValue?: any) {
        if (key) return this.query[key] ?? defaultValue;
        return this.query;
    }

    public getInputParam(key?: string, defaultValue?: any) {
        if (key) return this.params[key] ?? defaultValue;
        return this.params;
    }

    public onlyBody(...keys: string[]) {
        const body: any = {};

        keys.forEach((key) => {
            if (this.body[key]) body[key] = this.body[key];
        });

        return body;
    }

    public onlyQuery(...keys: string[]) {
        const query: any = {};

        keys.forEach((key) => {
            if (this.query[key]) query[key] = this.query[key];
        });

        return query;
    }

    public onlyParams(...keys: string[]) {
        const params: any = {};

        keys.forEach((key) => {
            if (this.params[key]) params[key] = this.params[key];
        });

        return params;
    }

    public onlyFiles(...keys: string[]) {
        const files: any = {};

        keys.forEach((key) => {
            if (this.files[key]) files[key] = this.files[key];
        });

        return files;
    }
    
    public exceptBody(...keys: string[]) {
        const body: any = {};

        Object.keys(this.body).forEach((key) => {
            if (!keys.includes(key)) body[key] = this.body[key];
        });

        return body;
    }

    public exceptQuery(...keys: string[]) {
        const query: any = {};

        Object.keys(this.query).forEach((key) => {
            if (!keys.includes(key)) query[key] = this.query[key];
        });

        return query;
    }

    public exceptParams(...keys: string[]) {
        const params: any = {};

        Object.keys(this.params).forEach((key) => {
            if (!keys.includes(key)) params[key] = this.params[key];
        });

        return params;
    }

    public exceptFiles(...keys: string[]) {
        const files: any = {};

        Object.keys(this.files).forEach((key) => {
            if (!keys.includes(key)) files[key] = this.files[key];
        });

        return files;
    }

    public whenHasBody(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void {
        if (this.hasBody(key)) {
            callback(this.body[key]);
        }
        if (callbackNotFound) {
            callbackNotFound();
        }
    }

    public whenHasQuery(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void {
        if (this.hasQuery(key)) {
            callback(this.query[key]);
        }
        if (callbackNotFound) {
            callbackNotFound();
        }
    }

    public whenHasParam(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void {
        if (this.hasParam(key)) {
            callback(this.params[key]);
        }
        if (callbackNotFound) {
            callbackNotFound();
        }
    }

    public whenHasFiles(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void {
        if (this.hasFiles(key)) {
            callback(this.files[key]);
        }
        if (callbackNotFound) {
            callbackNotFound();
        }
    }

    get languages() {
        return this.$languages;
    }

    get subdomain() {
        return this.$subdomain;
    }

    get protocol() {
        return this.$protocol;
    }

    get accepts() {
        return this.$accepts;
    }

    get bearerToken() {
        return this.$bearerToken;
    }

    get body() {
        return this.$body;
    }

    get files() {
        return this.$files;
    }

    get cookies() {
        return this.$cookies;
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