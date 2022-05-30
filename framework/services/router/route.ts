// deno-lint-ignore-file no-explicit-any
export default class Route {
    private __uri: string;
    private __method?: string | string[];
    private __handler?: any;
    private __middlewares?: any;
    private __domain?: string;
    private __name?: string;
    private __redirect?: boolean;
    private __regexp?: string | string[];

    constructor(
        uri: string,
        method?: string | string[],
        handler?: any,
        middlewares?: any,
        domain?: string,
        name?: string,
        redirect?: boolean,
        regexp?: string | string[]
    ) {
        this.__uri = uri;
        this.__method = method;
        this.__handler = handler;
        this.__middlewares = middlewares;
        this.__domain = domain;
        this.__name = name;
        this.__redirect = redirect;
        this.__regexp = regexp;
    }

    get uri(): string {
        return this.__uri;
    }

    get method() {
        return this.__method;
    }

    get handler() {
        return this.__handler;
    }

    get middlewares() {
        return this.__middlewares;
    }

    get domain() {
        return this.__domain;
    }

    get name() {
        return this.__name;
    }

    get redirect() {
        return this.__redirect;
    }

    get regexp() {
        return this.__regexp;
    }
}
