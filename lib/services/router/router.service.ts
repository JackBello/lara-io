// deno-lint-ignore-file no-explicit-any no-this-alias
import { Service } from '../services.ts';

import { RouterMiddlewareService } from './router-middleware.service.ts';
import { RouterHistoryService } from './router-history.service.ts';
import { RouterStaticsService } from './router-statics.service.ts';

import { TemplateEngineService } from '../template/template-engine.service.ts';

import Route from './route.ts';

import { ISettingRoute, IGroup } from '../../@types/route.ts';
import { TRequest, TResponse, TAllMethodHTTP, TMethodHTTP } from '../../@types/server.ts';
import { getBasePath } from '../../utils/index.ts';

import { Path } from '../../dep.ts';

const { extname } = Path;

export class RouterService extends Service {
    protected __routes: Array<Route> = [];

    protected __strict?: boolean;

    protected __currentRoute?: Route;
    protected __paramsRoute?: any;

    protected _context_: any;

    protected __route: any = {
        middleware: undefined,
        pattern: undefined,
        name: undefined,
    }

    protected __group: IGroup = {
        middleware: [],
        controller: [],
        namespace: [],
        domain: [],
        prefix: [],
        name: []
    }

    protected __template?: TemplateEngineService;
    
    protected __middleware?: RouterMiddlewareService;
    protected __statics?: RouterStaticsService;
    protected __history?: RouterHistoryService;
    
    protected __hostname?: string;
    protected __request?: TRequest;

    protected __pathController?: string;
    protected __pathMiddleware?: string;

    protected makePattern(uri: string, patterns: string | string[] = "") {
        let request: Request;

        if (!this.__request) throw new Error("the request undefined");
        else request = this.__request;

        const pattern: URLPattern = new URLPattern(request.url);

        const regExp = /(\{[a-z]+(\?|)\})/g;

        const params: Array<string> = uri.match(regExp)?.map(param => param.replace(/\{|\}|\?/g, "")) || [];

        let urlRegExp = "";

        if (Array.isArray(patterns)) {
            patterns.forEach((pattern: string, index: number) => {
                urlRegExp += `/:${params[index]}${pattern}`;
            });
        } else {
            urlRegExp = `${uri}${patterns}`
                .replace(/\{/g,":")
                .replace(/\}/g,"")
                .replace(`${pattern.hostname}`,"")
        }

        const match = new URLPattern(urlRegExp, `${pattern.protocol}://${pattern.hostname}`);
        
        const groups = match.exec(`${pattern.protocol}://${pattern.hostname}${pattern.pathname}`)?.pathname.groups;

        this.__paramsRoute = groups;

        const result = [];

        for (const param in params) {
            if (groups) result.push(groups[params[param]]);
        }

        return result.filter(param => param !== "");
    }

    protected async loadRoute() {
        if (!this.__request)
            throw new Error("the request not defined");

        if (!this.__strict)
            throw new Error("the strict not defined");

        const pattern: URLPattern = new URLPattern(this.__request.url);

        const method: TAllMethodHTTP = this.__request.method;
        const pathname: string = pattern.pathname;
        const hostname: string = pattern.hostname;
        const url = `${hostname}${pathname}`;

        const route: Route = this.__routes.filter(route => {
            const uriPattern: string | string[] = route.regexp ? route.regexp : "[a-zA-Z0-9]+";

            const domain = `${route.domain}`
                .replace(/\{[a-z]+\}/g,"[a-zA-Z0-9]+");
            
            const uri = `${route.uri}`
                .replace(/\/\{[a-z]+\?\}/g, `(\/${uriPattern}|)`)
                .replace(/\/\{[a-z]+\}/g, `\/${uriPattern}`)

            const regExp = new RegExp(`^${domain}${uri}$`);

            if (url.match(regExp)) return route;
        })[0];

        if (!route && this.__statics && extname(pathname) === "")
            return this.__statics.getFolder(pathname);
        else if (!route && this.__statics && extname(pathname) !== "")
            return await this.__statics.getFile(pathname);
        else if (!route) throw new Error(`This url '${pathname}' no exist to router`);

        if (route.redirect)
            return route;

        if (method !== route.method)
            throw new Error(`This method '${method}' is not support in this route '${route.uri}'`)

        return route;
    }

    protected async loadAction(action: any, uri: string, pattern?: string | string[]) {
        if (!this.__request) throw new Error("the request undefined");
        if (!this.__middleware) throw new Error("the middleware undefined");

        const $routeContext = this.app.use("route/context");
        const $httpRequest = this.app.use("http/request");

        if(typeof action === "function") {
            let params: Array<any> = [];

            if (pattern) params = this.makePattern(uri, pattern);
            else params = this.makePattern(uri);

            $httpRequest.setRoute(this.__currentRoute);
            $httpRequest.setParams(this.__paramsRoute);
    
            await $httpRequest.serialize();

            if (params.length) this.__middleware.setAction(await action($routeContext.getContext(), ...params));
            else this.__middleware.setAction(await action($routeContext.getContext()));

            this.__middleware.setContext($routeContext.getContext());

            await this.__middleware.run();

            return this.__middleware.result;
        } 

        else if (Array.isArray(action)) {
            const makeController = new action[0];

            const dependencies: any[] = this.app.resolveDependencies(action[0], action[1]);            

            if (dependencies.length > 0) {
                return makeController[action[1]].call(makeController, ...dependencies);
            } else {
                return makeController[action[1]].call(makeController);
            }
        }
        
        else if(typeof action === "string"){
            const [name, method]: string[] = action.split("@");

            if (name.indexOf(".") !== -1) {
                const file = `${name}.ts`;
                const pathname = getBasePath(`${this.__pathController}${file}`);
                const controller = await import(pathname);

                const makeController = new controller.default();

                const dependencies: any[] = this.app.resolveDependencies(controller.default, method);

                if (dependencies.length > 0) {
                    return makeController[method].call(makeController, ...dependencies);
                } else {
                    return makeController[method].call(makeController);
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
                    return makeController[method].call(makeController, ...dependencies);
                } else {
                    return makeController[method].call(makeController);
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
        else if (typeof action === "string" || typeof action === "number" || typeof action === "boolean") return new Response(`${action}`, { status: 200, headers: { "Content-Type": "text/plain" } });
        else if (typeof action === "object") return new Response(JSON.stringify(action), { status: 200, headers: { "Content-Type": "application/json" } });
        else return new Response(null, { status: 404 });
    }

    protected async registerRoutes(routes: string): Promise<void> {
        await import(routes);
    }

    protected registerRoute(setting: ISettingRoute, action: any) {
        const {
            uri,
            method,
            middleware,
            name,
            regexp,
            redirect,
        } = setting;

        if (!this.__hostname)
            throw new Error("the hostname not defined");

        if (uri === undefined || uri === null)
            throw new Error('uri must be given');
        
        if (method === undefined || method === null)
            throw new Error('method must be given');
        
        if (action === undefined || action === null)
            throw new Error('callback must be given');

        if (typeof uri !== "string")
            throw new TypeError('typeof uri must be a string');

        if (typeof method !== "string" && !Array.isArray(method))
            throw new TypeError('typeof method must be a string or array');
        
        if (typeof action !== "function" && typeof action !== "string" && !Array.isArray(action))
            throw new TypeError('typeof action must be a function, string or array');

        let groupDomain: string;
        if (this.__group.domain[0]) groupDomain = this.__group.domain[0];
        else groupDomain = this.__hostname;

        let gruopPrefix: string;
        if (this.__group.prefix[0]) gruopPrefix = this.__group.prefix[0].startsWith("/") ? this.__group.prefix[0] : `/${this.__group.prefix[0]}`;
        else gruopPrefix = "";

        let groupName: string;
        if (this.__group.name[0]) groupName = this.__group.name[0];
        else groupName = "";
        
        if (gruopPrefix === "" && !uri.startsWith("/"))
            throw new Error('uri must be start with "/"');

        this.__routes.forEach(route => {
            if (route.name === `${groupName}${name}`) throw new Error(`the route with the name '${groupName}${name}' already exists`);
        });

        this.__routes.filter(route => {
            if (`${route.domain}${route.uri}` === `${groupDomain}${gruopPrefix}${uri}`) {
                if (Array.isArray(method)) {
                    //
                } else {
                    if (route.method === method) throw new Error(`the route with the uri '${groupDomain}${gruopPrefix}${uri}' and method '${method}' already exists`);
                }
            }
        });

        const route = new Route(`${gruopPrefix}${uri}`, method,action,middleware,groupDomain, name, redirect, regexp);

        this.__routes.push(route);
    }

    protected execGroup(routes: any, type?: string): Promise<void> | void {
        if (typeof routes === "string") {
            return new Promise(resolve => {
                this.registerRoutes(routes).then(() => {
                    if (type) this.__group[type].shift();

                    resolve();
                });
            })
        } else {
            routes();

            if (type) this.__group[type].shift();
        }
    }

    public graphql(schema: any, rootValue?: any, context?: any, info?: any) {
        schema;
        rootValue;
        context;
        info;
    }

    public get(uri: string, name: string, action: any, middleware?: any) {
        this.registerRoute({ uri, method: "GET", name: name, regexp: undefined , middleware}, action);
    }

    public post(uri: string, name: string, action: any, middleware?: any) {
        this.registerRoute({ uri, method: "POST", name: name, regexp: undefined , middleware}, action);
    }

    public put(uri: string, name: string, action: any, middleware?: any) {
        this.registerRoute({ uri, method: "PUT", name: name, regexp: undefined , middleware}, action);
    }

    public delete(uri: string, name: string, action: any, middleware?: any) {
        this.registerRoute({ uri, method: "DELETE", name: name, regexp: undefined , middleware}, action);
    }

    public patch(uri: string, name: string, action: any, middleware?: any) {
        this.registerRoute({ uri, method: "PATCH", name: name, regexp: undefined , middleware}, action);
    }

    public match(methods: TMethodHTTP, uri: string, name: string, action: any, middleware?: any) {
        this.registerRoute({ uri, method: methods, name: name, regexp: undefined , middleware}, action);
    }

    public any(uri: string, name: string, action: any, middleware?: any) {
        this.registerRoute({ uri: uri, method: ["DELETE", 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT'], name: name, regexp: undefined , middleware}, action);
    }
    
    public redirect(uri: string, destination: string, code = 302) {
        this.registerRoute({ uri, method: ["DELETE", 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT'], redirect: true }, () => {
            return this.__history?.redirect(destination, code);
        });
    }

    public permanentRedirect(uri: string, destination: string) {
        this.registerRoute({ uri, method: ["DELETE", 'GET', 'OPTIONS', 'PATCH', 'POST', 'PUT'], redirect: true }, () => {
            return this.__history?.redirect(destination, 301);
        });
    }
    
    public view(uri: string, view: string, data: any = {}) {
        if (!this.__template) throw new Error("template must be given");

        const self = this;

        this.registerRoute({
            uri,
            name: view,
            method: "GET",
        }, async () => {
            return await self.__template?.view(view, data);
        });
    }

    public async group(routes: any) {
        await this.execGroup(routes);
    }

    public namespace(namespace: any) {
        namespace;
    }

    public middleware(middleware: any) {
        return {
            group: (routes: any) => {
                this.__group.middleware.unshift(middleware);
                this.execGroup(routes, "middleware");
            },
        };
    }

    public controller(controller: any) {
        return {
            group: (routes: any) => {
                this.__group.controller.unshift(controller);
                this.execGroup(routes, "controller");
            },
        };
    }

    public prefix(prefix: string) {
        return {
            group: (routes: any) => {
                this.__group.prefix.unshift(prefix);
                this.execGroup(routes, "prefix");
            },
        };
    }

    public domain(domain: string) {
        return {
            group: (routes: any) => {
                this.__group.domain.unshift(domain);
                this.execGroup(routes, "domain");
            },
        };
    }

    public name(name: string) {
        return {
            group: (routes: any) => {
                this.__group.name.unshift(name);
                this.execGroup(routes, "name");
            },
        };
    }

    public applyHandleError(handle: (error: unknown, request?: TRequest) => TResponse) {
        this.handleError = handle;
    }

    public applyHandleResponse(handle: (action: any) => TResponse) {
        this.handleResponse = handle;
    }

    public useTemplate(template: TemplateEngineService) {
        this.__template = template;
    }

    public useMiddleware(middleware: RouterMiddlewareService) {
        this.__middleware = middleware;
    }

    public useFileStatic(statics: RouterStaticsService) {
        this.__statics = statics;
    }

    public useHistory(history: RouterHistoryService) {
        this.__history = history;
    }

    public setPathController(path: string) {
        this.__pathController = `${path}/controllers/`;
    }

    public setPathMiddleware(path: string) {
        this.__pathMiddleware = `${path}/middlewares/`;
    }

    public setRequest(request: TRequest) {
        this.__request = request;
    }

    public sethostname(hostname: string) {
        this.__hostname = hostname;
    }

    public setStrict(strict: boolean) {
        this.__strict = strict;
    }

    get routes() {
        return this.__routes;
    }

    get currentRoute() {
        return this.__currentRoute;
    }

    public async lookPetitions() {
        try {
            const route: Route | Promise<Route> = await this.loadRoute();
            
            this.__currentRoute = route;

            if (route.redirect) return this.handleResponse(route.handler());

            if (this.__history) this.__history.handleHistory(route);

            if (this.__middleware) {
                if (route.middlewares) this.__middleware.add(route.middlewares);
            }

            const action = await this.loadAction(route.handler, route.uri, route.regexp);

            return this.handleResponse(action);
        } catch (error) {
            return this.handleError(error, this.__request);
        }
    }
}