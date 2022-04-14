// deno-lint-ignore-file no-explicit-any
import { Service } from '../services.ts';

import { RouterHistoryService } from './router-history.service.ts';
import { RouterStaticsService } from './router-statics.service.ts';

import { IRoute, ISettingRoute, IGroup } from '../../@types/interfaces/router.interface.ts';
import { TRequest, TResponse, TAllMethodHTTP, TMethodHTTP } from '../../@types/type/server.type.ts';
import { getBasePath } from '../../utils/index.ts';

import { Path } from '../../dep.ts';

const { extname } = Path;

// if (route.middleware) {
//     const middleware = this.app.resolveDependencies(route.middleware);

//     if (middleware.length > 0) {
//         return middleware[0].apply(middleware[0], [this.__request, action]);
//     } else {
//         return route.middleware.apply(route.middleware, [this.__request, action]);
//     }
// }

export class RouterService extends Service {
    protected __routes: Array<IRoute> = [];

    protected __route: any = {
        name: undefined,
        pattern: undefined,
        middleware: undefined,
        controller: undefined,
    }
    protected __group: IGroup = {
        middleware: undefined,
        controller: undefined,
        domain: undefined,
        prefix: undefined,
        name: undefined
    }

    protected __statics?: RouterStaticsService;
    protected __history?: RouterHistoryService;
    protected __request?: TRequest;
    protected __pattern?: URLPattern;
    protected __pathController?: string;
    protected __pathMiddleware?: string;
    protected __url?: string;

    get routes() {
        return this.__routes;
    }

    public setPathController(url: string) {
        this.__pathController = `${url}/http/controllers/`;
    }

    public setPathMiddleware(url: string) {
        this.__pathMiddleware = url;
    }

    protected makePattern(uri: string, patterns: string | string[] = "") {
        let request: Request, pattern: URLPattern;

        if (!this.__request) throw new Error("the request undefined");
        else request = this.__request;

        if (!this.__pattern) throw new Error("the pattern undefined");
        else pattern = this.__pattern;

        const regExp = /(\:[a-zA-Z]+|\{[a-zA-Z]+\})(\?|)/g;

        const params: Array<any> = uri.match(regExp)?.map(param => {
            if (param.slice(0, 1) === ":") {
                return (param.slice(param.length - 1) === "?") ? param.slice(1, -1) : param.slice(1)
            }
            if (param.slice(0, 1) === "{") {
                return (param.slice(param.length - 1) === "?") ? param.slice(1, -2) : param.slice(1, -1)
            }
        }) || [];

        let urlRegExp = "";

        if (Array.isArray(patterns)) {
            patterns.forEach((pattern: string, index: number) => {
                urlRegExp += `/:${params[index]}${pattern}`;
            });
        } else {
            urlRegExp = `${uri}${patterns}`
        }

        const match = new URLPattern(urlRegExp, `${pattern.protocol}://${pattern.hostname}`);

        const groups = match.exec(request.url)?.pathname.groups;

        const result = [];

        for (const param in params) {
            if (groups) result.push(groups[params[param]]);
        }

        return result.filter(param => param !== "");
    }

    protected async loadRoute() {
        let pattern: URLPattern, request: Request;

        if (!this.__pattern) throw new Error("the path undefined");
        else pattern = this.__pattern;

        if (!this.__request) throw new Error("the request undefined");
        else request = this.__request;

        const method: TAllMethodHTTP = request.method;
        const pathname: string = pattern.pathname;

        const route: IRoute = this.__routes.filter(route => {
            let regExp: RegExp, uri: string;

            if (route.uri.search(/(\{[a-zA-Z0-9]+\}|\:[a-zA-Z0-9]+)(\?|)/g) !== -1) {
                uri = route.uri
                    .replace(/\/(\{[a-zA-Z0-9]+\}|\:[a-zA-Z0-9]+)\?/g, "(\/|)([a-zA-Z0-9]+|)")
                    .replace(/\/(\{[a-zA-Z0-9]+\}|\:[a-zA-Z0-9]+)/g, "(\/|)[a-zA-Z0-9]+")

                regExp = new RegExp(`^${uri}$`);
            } else {
                regExp = new RegExp(`^${route.uri}$`);
            }

            if (pathname.match(regExp)) return route;
        })[0];

        if (!route) {
            if (this.__statics) {
                if(pathname === "/" || extname(pathname)) return await this.__statics.getFile(pathname);
                else throw new Error(`This url '${pathname}' no exist to router`);
            }
            else throw new Error(`This url '${pathname}' no exist to router`);
        }

        if (method !== route.method) throw new Error(`This method '${method}' is not support in this route '${route.uri}'`)

        return route;
    }

    protected async loadController(action: any, uri: string, pattern?: string | string[]) {
        // let request;

        if (!this.__request) throw new Error("the request undefined");

        const $request = this.app.use("request");

        if (Array.isArray(action)) {
            const makeController = new action[0];

            const dependencies: any[] = this.app.resolveDependencies(action[0], action[1]);

            if (dependencies.length > 0) {
                return makeController[action[1]].apply(makeController, ...dependencies);
            } else {
                return makeController[action[1]].apply(makeController, $request);
            }
        } else if(typeof action === "function") {
            let params: Array<any> = [];

            if (pattern) params = this.makePattern(uri, pattern);
            else params = this.makePattern(uri);

            if (params.length) return action(...params);

            return action($request);
        } else if(typeof action === "string"){
            const [name, method]: string[] = action.split("@");

            if (name.indexOf(".") !== -1) {
                const file = `${name}.ts`;
                const pathname = getBasePath(`${this.__pathController}${file}`);
                const controller = await import(pathname);

                const makeController = new controller.default();

                const dependencies: any[] = this.app.resolveDependencies(controller.default, method);

                if (dependencies.length > 0) {
                    return makeController[method].apply(makeController, ...dependencies);
                } else {
                    return makeController[method].apply(makeController, $request);
                }
            }

            try {
                const stat = Deno.statSync(`${this.__pathController}${name}`);

                if (stat.isFile) {
                    //
                }
            } catch {
                const file = name.toLowerCase().replace("controller", ".controller.ts");
                const pathname = getBasePath(`${this.__pathController}${file}`);
                const controller = await import(pathname);

                const makeController = new controller.default();

                const dependencies: any[] = this.app.resolveDependencies(controller.default, method);

                if (dependencies.length > 0) {
                    return makeController[method].apply(makeController, ...dependencies);
                } else {
                    return makeController[method].apply(makeController, $request);
                }
            }
        }
    }

    protected handleError: (error: unknown, request?: TRequest) => TResponse = (error: unknown) => {
        console.log(error);
        return new Response(null, { status: 404 });
    };

    protected handleResponse: (action: any) => TResponse = (action: any) => {
        if (action instanceof Response) return action;
        else if (typeof action === "string") return new Response(action, { status: 200, headers: { "Content-Type": "text/plain" } });
    }

    public applyHandleError(handle: (error: unknown, request?: TRequest) => TResponse) {
        this.handleError = handle;
    }

    public applyHandleResponse(handle: (action: any) => TResponse) {
        this.handleResponse = handle;
    }

    public registerRoute(setting: ISettingRoute, action: any) {
        const {
            uri,
            method,
            middleware,
            name,
            pattern
        } = setting;

        if (!uri) throw new Error('uri must be given');
        if (!method) throw new Error('method must be given');
        if (!action) throw new Error('callback must be given');

        if (typeof uri !== "string") throw new TypeError('typeof uri must be a string');
        if (typeof method !== "string" || Array.isArray(method)) throw new TypeError('typeof uri must be a string');

        if (typeof action !== "function" && typeof action !== "string" && !Array.isArray(action)) throw new TypeError('typeof action must be a function, string or array');

        // let groupMiddleware: Array<any>;
        // if (this.__group.middleware) groupMiddleware = this.__group.middleware;
        // else groupMiddleware = [];

        // let groupController: string;
        // if (this.__group.controller) groupController = this.__group.controller;
        // else groupController = "";

        // let groupDomain: string;
        // if (this.__group.domain) groupDomain = this.__group.domain;
        // else groupDomain = "";

        let gruopPrefix: string;
        if (this.__group.prefix) gruopPrefix = this.__group.prefix.slice(0, 1) === "/" ? this.__group.prefix : `/${this.__group.prefix}`;
        else gruopPrefix = "";

        let groupName: string;
        if (this.__group.name) groupName = this.__group.name;
        else groupName = "";

        let route: IRoute;

        if (uri.slice(0, 1) !== "/") throw new Error('uri must be start with "/"');

        route = this.__routes.filter((route: IRoute) => route.name === `${groupName}${name}`)[0];

        if (route) throw new Error(`the route name '${groupName}${route.name}' already exists`);

        route = this.__routes.filter((route: IRoute) => route.uri === `${gruopPrefix}${uri}`)[0];

        if (route) {
            if (route.method === method) throw new Error(`the uri '${route.uri}' with method '${route.method}' already exists`);
        }

        let mode: string;
        if (this.__history) mode = this.__history.mode === "hash" ? "#" : "";
        else mode = "";

        this.__routes.push({
            uri: `${mode}${gruopPrefix}${uri}`,
            method,
            middleware,
            name,
            pattern,
            action
        });
    }

    public get(uri: string, name: string, action: any) {
        this.registerRoute({ uri, method: "GET", name: name, pattern: undefined }, action);
    }

    public post(uri: string, name: string, action: any) {
        this.registerRoute({ uri, method: "POST", name: name, pattern: undefined }, action);
    }

    public put(uri: string, name: string, action: any) {
        this.registerRoute({ uri, method: "PUT", name: name, pattern: undefined }, action);
    }

    public delete(uri: string, name: string, action: any) {
        this.registerRoute({ uri, method: "DELETE", name: name, pattern: undefined }, action);
    }

    public patch(uri: string, name: string, action: any) {
        this.registerRoute({ uri, method: "PATCH", name: name, pattern: undefined }, action);
    }

    public match(methods: TMethodHTTP, uri: string, name: string, action: any) {
        this.registerRoute({ uri, method: methods, name: name, pattern: undefined }, action);
    }
    
    public view(uri: string, view: string, data: any = {}) {
        const { resources } = this.app.config("paths");
        const template = this.app.use("template");

        const path = getBasePath(`${resources}/views/${view}.atom.ts`);

        import(path).then((module: any) => {
            if (typeof module.default !== "function") throw new Error("the view must be a function");

            this.registerRoute({
                uri,
                name: view,
                method: "GET",
            }, () => {
                return new Response(template.render(module.default(), data), { headers: { "Content-Type": "text/html" }, status: 200 });
            });
        });

        return this;
    }

    protected async registerRoutes(routes: string): Promise<void> {
        await import(routes);
    }

    public group(routes: any): Promise<void> | void {
        if (typeof routes === "string") {
            return new Promise(resolve => {
                this.registerRoutes(routes).then(() => {
                    if (this.__group.middleware) this.__group.middleware = undefined;
                    if (this.__group.controller) this.__group.controller = undefined;
                    if (this.__group.domain) this.__group.domain = undefined;
                    if (this.__group.prefix) this.__group.prefix = undefined;
                    if (this.__group.name) this.__group.name = undefined;
                    resolve();
                });
            })
        } else {
            routes();

            if (this.__group.middleware) this.__group.middleware = undefined;
            if (this.__group.controller) this.__group.controller = undefined;
            if (this.__group.domain) this.__group.domain = undefined;
            if (this.__group.prefix) this.__group.prefix = undefined;
            if (this.__group.name) this.__group.name = undefined;
        }
    }

    public middleware(middleware: any) {
        this.__group.middleware = middleware;
        return this;
    }

    public controller(controller: any) {
        this.__group.controller = controller;
        return this;
    }

    public prefix(prefix: string) {
        this.__group.prefix = prefix;
        return this;
    }

    public domain(domain: string) {
        this.__group.domain = domain;
        return this;
    }

    public name(name: string) {
        this.__group.name = name;
        return this;
    }

    public lookStatics(statics: RouterStaticsService) {
        this.__statics = statics;
    }

    public lookHistory(history: RouterHistoryService) {
        this.__history = history;
    }

    public lookRequest(request: TRequest) {
        this.__url = request.url;
        this.__request = request;
        this.__pattern = new URLPattern(request.url);
    }

    public async lookPetitions() {
        try {
            const route: IRoute | Promise<IRoute> = await this.loadRoute();

            if (this.__history) this.__history.handleHistory(route);

            const action = await this.loadController(route.action, route.uri, route.pattern);

            return this.handleResponse(action);
        } catch (error) {
            return this.handleError(error, this.__request);
        }
    }
}