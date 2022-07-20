// deno-lint-ignore-file no-inferrable-types no-explicit-any
export class HttpClient {
    protected client: any = fetch;

    private __headers: Headers = new Headers();
    private __protocol: string = "http";
    private __hostname: string = "";
    private __method: string = "GET";
    private __body: any = null;

    protected validateURL() {

    }

    public setMethod(method: "GET" | "POST" | "PUT" | "DELETE" | "PATH" | "OPTIONS") {
        this.__method = method;
    }

    public setHostname(hostname: string) {
        this.__hostname = hostname;
    }

    public setProtocol(protocol: "http" | "https") {
        this.__protocol = protocol;
    }

    public setBody(body: any) {
        this.__body = body;
    }

    public setHeader(name: string, value: string) {
        this.__headers.set(name, value)
        return this;
    }

    public setHeaders(headers: Record<string, string>) {
        for (const key in headers) this.__headers.set(key, headers[key]);
        return this;
    }

    public request() {

    }

    public get(url: string, data?: any, options?: any) {

    }

    public post(url: string, data?: any, options?: any) {

    }

    public put(url: string, data?: any, options?: any) {

    }

    public delete(url: string, data?: any, options?: any) {

    }

    public options(url: string, data?: any, options?: any) {

    }

    public path(url: string, data?: any, options?: any) {

    }
}
