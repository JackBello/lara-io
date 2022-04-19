// deno-lint-ignore-file no-explicit-any
import { IConnectionInfo } from '../../@types/interfaces/server.interface.ts';

export class RequestRoute {
    protected __urlPattern?: URLPattern;
    protected __coneccionInfo?: IConnectionInfo;
    protected __request?: Request;
    protected __session?: any;
    protected __route?: string;
    protected __user?: any;

    public lookConnectionInfo(connectionInfo: IConnectionInfo) {
        this.__coneccionInfo = connectionInfo;
    }

    public lookRequest(request: Request) {
        this.__request = request;
        this.__urlPattern = new URLPattern(request.url);
    }

    public lookSession(session: any) {
        this.__session = session;
    }

    public lookRoute(route: string) {
        this.__route = route;
    }

    public lookUser(user: any) {
        this.__user = user;
    }

    protected getIp() {
        if (!this.__coneccionInfo) throw new Error("ConnectionInfo not found");

        const { hostname } = this.__coneccionInfo.remoteAddr as Deno.NetAddr;

        return hostname;
    }

    protected getMethod() {
        if (!this.__request) throw new Error("Request not found");
        
        return this.__request.method;
    }

    protected getRoute() {

    }

    protected getFullUrl() {
        if (!this.__request) throw new Error("Request not found");

        return this.__request.url;
    }

    protected getUrl() {
        if (!this.__urlPattern) throw new Error("UrlPattern not found");

        return `${this.__urlPattern.protocol}//${this.__urlPattern.hostname}`;
    }

    protected getUri() {
        if (!this.__urlPattern) throw new Error("UrlPattern not found");

        return this.__urlPattern.pathname;
    }

    protected getQuery() {
        if (!this.__urlPattern) throw new Error("UrlPattern not found");

        const searchParams = new URLSearchParams(this.__urlPattern.search);

        const query: Record<string, string> = {};

        searchParams.forEach((value, key) => {
            query[key] = value;
        });

        return query;
    }

    protected getHeaders() {
        const headers: Record<string, string> = {};

        this.__request?.headers.forEach((value, key) => {
            headers[key] = value;
        });

        return headers;
    }

    get headers() {
        return this.getHeaders();
    }

    get query() {
        return this.getQuery();
    }

    get method() {
        return this.getMethod();
    }

    get baseUrl() {
        return this.getUrl();
    }

    get baseUri() {
        return this.getUri();
    }

    get fullUrl() {
        return this.getFullUrl();
    }
    
    get ip() {
        return this.getIp();
    }
}