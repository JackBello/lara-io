// deno-lint-ignore-file no-explicit-any no-inferrable-types
import { Service } from '../services.ts';

import { RouterHistoryService } from './router-history.service.ts';
import { RouterStaticsService } from './router-statics.service.ts';

import { TemplateEngineService } from '../template/template-engine.service.ts';

import Route from './route.ts';
import RouteException from '../../foundation/exceptions/router/route.exception.ts';
import RouterException from '../../foundation/exceptions/router/router.exception.ts';

import { ISettingRoute, IGroup } from '../../@types/route.ts';
import { TRequest, TAllMethodHTTP, TMethodHTTP } from '../../@types/server.ts';
import { getBasePath } from '../../helpers/utils.ts';
import { HandlerException } from '../../foundation/exceptions/handler-exceptions.ts';
import { HttpKernel } from '../../foundation/http/http-kernel.ts';

import { injectPropertiesToController, injectParamsToController } from '../../foundation/dependency-injection.ts';

import { formatter } from '../../helpers/utils.ts';

import { Path } from '../../dependencies.ts';

const { extname } = Path;

export class RouterService extends Service {
    protected __handler: HandlerException = this.app.make("@handler", {});
    protected __kernel: HttpKernel = this.app.make("@kernel", {});

    protected __result: any;

    protected __routes: Array<Route> = [];
    protected __errors: Map<number, any> = new Map();

    protected __strict?: boolean;

    protected __currentRoute?: Route;
    protected __paramsContext: Record<string, any> = {};
    protected __paramsRoute: any[] = [];

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
        subdomain: [],
        hostname: [],
        prefix: [],
        name: []
    }

    protected __template?: TemplateEngineService;

    protected __statics?: RouterStaticsService;
    protected __history?: RouterHistoryService;

    protected __hostname?: string;
    protected __request?: TRequest;

    protected __pathController?: string;
    protected __pathMiddleware?: string;

    public isProxy: boolean = false;

    protected makePattern(urlRequest: string, urlRoute: string) {
        const matchParams = new URLPattern(urlRoute.replace(/\{/g,":").replace(/\}/g,""));

        const result = matchParams.exec(urlRequest);

        const paramsObject: Record<string, any> = {};
        const paramsList: any[] = [];

        if (result) {
            const { hostname, pathname } = result;

            const merged = {...hostname.groups, ...pathname.groups};

            for (const prop in merged) {
                paramsObject[prop] = formatter(merged[prop])
            }
        }

        if (Object.keys(paramsObject).length === 0 && paramsObject.constructor === Object) {
            for (const prop in paramsObject) {
                paramsList.push(paramsObject[prop]);
            }
        }

        this.__paramsContext = paramsObject;
        this.__paramsRoute = paramsList;
    }

    protected matchPattern(pattern: any, urlRequest: string, urlRoute: string) {
        if (urlRequest.match(new RegExp(`^${urlRoute}$`))) return true;
        else throw Error(`Pattern error ${pattern}`)
    }

    protected convertURI(uri: string, pattern?: string | string | Record<string, any>) {
        let result = uri;
        let defaultPattern: string | Record<string, any> = "[a-zA-Z0-9]+";

        if (pattern) defaultPattern = pattern;

        if (typeof defaultPattern === "string") {
            if (result.match(/\:[a-zA-Z]+\?/g) || result.match(/\:[a-zA-Z]+/g) || result.match(/\{[a-zA-Z]+\}/g) || result.match(/\([a-zA-Z|]+\)/g)) {
                result = result
                    .replace(/\/\:[a-zA-Z]+\?/g, `(\/${defaultPattern}|)`)
                    .replace(/\:[a-zA-Z]+/g, `${defaultPattern}`)
                    .replace(/\{[a-zA-Z]+\}/g, `${defaultPattern}`)
            }
        } else {
            for (const paramPattarn in defaultPattern) {
                if (result.includes(`:${paramPattarn}?`)) {
                    result = result.replace(`/:${paramPattarn}?`, `(\/${defaultPattern[paramPattarn]}|)`);
                } else if (result.includes(`:${paramPattarn}`)) {
                    result = result.replace(`:${paramPattarn}`, `${defaultPattern[paramPattarn]}`);
                } else if (result.includes(`{${paramPattarn}}`)) {
                    result = result.replace(`{${paramPattarn}}`, `${defaultPattern[paramPattarn]}`);
                }
            }
        }

        return result;
    }

    protected async loadRoute() {
        if (!this.__request)
            throw new RouterException("the request is undefined in the router", "router");

        if (!this.__strict)
            throw new RouterException("the strict is undefined in the router", "router");

        let route: Route | undefined;

        const method: TAllMethodHTTP = this.__request.method;
        const { hostname: domain, pathname: uri, protocol } = new URLPattern(this.__request.url);

        const error = {
            active: false,
            type: "",
            message: ""
        };

        const routesByDomain = this.__routes.filter((route) => {
            if (route.domain === domain) return route;
            else return route;
        });

        const filterByUri = (route: Route) => {
            const urlRoute = `${route.domain}${route.uri}`;
            const urlRequest = `${domain}${uri}`;

            if (urlRoute === urlRequest) return route;
        }

        const filterByMatchUri = (route: Route) => {
            const urlRoute = `${route.domain}${this.convertURI(route.uri)}`;
            const urlRequest = `${domain}${uri}`;

            if (urlRequest.match(new RegExp(`^${urlRoute}$`))) return route
        }

        const matchResult = (filter: any) => {
            const routesFilter = routesByDomain.filter(filter);
            let search;

            if (routesFilter.length !== 0) {
                if (routesFilter.length === 1) {
                    if (routesFilter[0].method === method) return routesFilter[0];
                    else {
                        error.active = true;
                        error.message = `This method '${method}' is not support in this route '${uri}'`;
                        error.type = "http/route/405";
                    }
                } else {
                    search = routesFilter.find(route => route.method === method);
                    if (search) {
                        return search
                    } else {
                        error.active = true;
                        error.message = `This method '${method}' is not support in this route '${uri}'`;
                        error.type = "http/route/405";
                    }
                }
            }
        }

        route = matchResult(filterByUri);

        if (error.active) throw new RouteException(error.message, error.type);

        if (!route) route = matchResult(filterByMatchUri);

        if (this.__statics && extname(uri) !== "")
            route = await this.__statics.getFile(uri);

        if (!route) {
            if (this.__statics && extname(uri) === "") route = await this.__statics.getFolder(uri);
            else {
                error.active = true;
                error.message = `This url '${uri}' no exist to router.`;
                error.type = "http/route/404";
            }
        }

        if (error.active) throw new RouteException(error.message, error.type);


        let urlRequest = `${domain}${uri}`;
        let urlRoute = `${route?.domain}${route?.uri}`;

        if (route?.regexp) {
            const urlRouteParsed = this.convertURI(`${route.domain}${route.uri}`, route.regexp);

            if (this.matchPattern(route.regexp, urlRequest, urlRouteParsed)) {
                urlRequest = `${protocol}://${domain}${uri}`;
                urlRoute = `${protocol}://${route?.domain}${route?.uri}`;

                this.makePattern(urlRequest, urlRoute);
            }
        } else {
            urlRequest = `${protocol}://${domain}${uri}`;
            urlRoute = `${protocol}://${route?.domain}${route?.uri}`;

            this.makePattern(urlRequest, urlRoute);
        }

        return route;
    }

    protected async loadAction(action: any) {
        if (!this.__request)
            throw new RouterException("the request is undefined in the router", "router");

        const $routeContext = this.app.use("route/context");
        const $httpRequest = this.app.use("http/request");

        this.__kernel.setContext($routeContext.getContext());

        if(typeof action === "function") {
            $httpRequest.setRoute(this.__currentRoute);
            $httpRequest.setParams(this.__paramsContext);

            await $httpRequest.serialize();

            if (this.__paramsRoute.length > 0) {
                return await action.call(this, $routeContext.getContext(), ...this.__paramsRoute);
            } else {
                return await action.call(this, $routeContext.getContext());
            }
        }

        else if (Array.isArray(action)) {
            const makeController = new action[0];
            const middlewares = makeController.getMiddlewares();
            const applied = makeController.getApplied();

            injectPropertiesToController(makeController);

            $httpRequest.setRoute(this.__currentRoute);
            $httpRequest.setParams(this.__paramsContext);

            await $httpRequest.serialize();

            if (middlewares) {
                const { only, except } = applied;

                if (only.length > 0) {
                    if (only.includes(action[1])) this.__kernel.add(middlewares);
                }
                else if (except.length > 0) {
                    if (!except.includes(action[1])) this.__kernel.add(middlewares);
                } else {
                    this.__kernel.add(middlewares);
                }
            }

            const dependencies: any[] = injectParamsToController(makeController, action[1]);

            if (dependencies.length > 0) {
                return makeController[action[1]].call(makeController, ...dependencies);
            } else {
                return makeController[action[1]].call(makeController);
            }
        }

        else if(typeof action === "string"){
            const [name, method]: string[] = action.split("@");

            const file = `${name.replace("Controller",".controller")}.ts`;
            const pathname = getBasePath(`${this.__pathController}${file}`);
            const controller = await import(pathname);

            const makeController = new controller.default();
            const middlewares = makeController.getMiddlewares();
            const applied = makeController.getApplied();

            injectPropertiesToController(makeController);

            $httpRequest.setRoute(this.__currentRoute);
            $httpRequest.setParams(this.__paramsContext);

            await $httpRequest.serialize();

            if (middlewares) {
                const { only, except } = applied;

                if (only.length > 0) {
                    if (only.includes(method)) this.__kernel.add(middlewares);
                }
                else if (except.length > 0) {
                    if (!except.includes(method)) this.__kernel.add(middlewares);
                } else {
                    this.__kernel.add(middlewares);
                }
            }

            const dependencies: any[] = injectParamsToController(makeController, action[1]);

            if (dependencies.length > 0) {
                return makeController[method].call(makeController, ...dependencies);
            } else {
                return makeController[method].call(makeController);
            }

        }
    }

    protected async registerRoutes(routes: string): Promise<void> {
        try {
            await import(routes);
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public registerRoute(setting: ISettingRoute, action: any) {
        const {
            uri,
            method,
            middleware,
            name,
            regexp,
            redirect,
            proxy
        } = setting;

        if (!this.__hostname)
            throw new RouterException("the hostname not defined", "router/register-route");

        if (uri === undefined || uri === null)
            throw new RouterException('uri must be given', "router/register-route");

        if (method === undefined || method === null)
            throw new RouterException('method must be given', "router/register-route");

        if (action === undefined || action === null)
            throw new RouterException('callback must be given', "router/register-route");

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
            throw new RouterException('uri must be start with "/"', "router/register-route");

        for (const route of this.__routes) {
            if (name) {
                if (route.name === `${groupName}${name}`) throw new RouterException(`the route with the name '${groupName}${name}' already exists`, "router/register-route");
            }
        }

        this.__routes.filter(route => {
            if (`${route.domain}${route.uri}` === `${groupDomain}${gruopPrefix}${uri}`) {
                if (Array.isArray(method)) {
                    method.forEach((method: string) => {
                        if (route.method === method) throw new RouterException(`the route with the uri '${groupDomain}${gruopPrefix}${uri}' and method '${method}' already exists`, "router/register-route");
                    });
                } else {
                    if (route.method === method) throw new RouterException(`the route with the uri '${groupDomain}${gruopPrefix}${uri}' and method '${method}' already exists`, "router/register-route");
                }
            }
        });

        const route = new Route(`${gruopPrefix}${uri}`, method,action,middleware,groupDomain, name, redirect, regexp, proxy);

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
        try {
            this.registerRoute({ uri, method: "GET", name: name, regexp: undefined , middleware}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public post(uri: string, name: string, action: any, middleware?: any) {
        try {
            this.registerRoute({ uri, method: "POST", name: name, regexp: undefined , middleware}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public put(uri: string, name: string, action: any, middleware?: any) {
        try {
            this.registerRoute({ uri, method: "PUT", name: name, regexp: undefined , middleware}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public delete(uri: string, name: string, action: any, middleware?: any) {
        try {
            this.registerRoute({ uri, method: "DELETE", name: name, regexp: undefined , middleware}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public patch(uri: string, name: string, action: any, middleware?: any) {
        try {
            this.registerRoute({ uri, method: "PATCH", name: name, regexp: undefined , middleware}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public head(uri: string, action: any) {
        try {
            this.registerRoute({ uri, method: "HEAD", name: undefined, regexp: undefined , middleware: undefined}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public match(methods: TMethodHTTP[] | TMethodHTTP, uri: string, name: string, action: any, middleware?: any) {
        try {
            this.registerRoute({ uri, method: methods, name: name, regexp: undefined , middleware}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public any(uri: string, name: string, action: any, middleware?: any) {
        try {
            this.registerRoute({ uri, method: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], name: name, regexp: undefined , middleware}, action);
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public redirect(uri: string, destination: string, code = 302) {
        try {
            this.registerRoute({ uri, method: "GET", redirect: true }, () => {
                return this.__history?.redirect(destination, code);
            });
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public permanentRedirect(uri: string, destination: string) {
        try {
            this.registerRoute({ uri, method: "GET", redirect: true }, () => {
                return this.__history?.redirect(destination, 301);
            });
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public view(uri: string, view: string, data: any = {}) {
        try {
            if (!this.__template) throw new RouteException("template must be given", "route/view/parameter");

            const selfTemplate = this.__template;

            this.registerRoute({
                uri,
                name: view,
                method: "GET",
            }, async () => {
                return await selfTemplate.view(view, data);
            });
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public socket(event: string, action: any) {
        event;
        action;
    }

    public error(status: number, message: string, action: any) {
        if (this.__errors.has(status)) {
            throw new RouteException(`this error status ${status} already exist to route errors`, "route/errors/exist");
        }

        this.__errors.set(status, {
            status,
            message,
            action
        })
    }

    public proxy(uri: string, url: string, port: number, methods: TMethodHTTP[] | TMethodHTTP = "GET") {
        try {
            this.registerRoute({
                uri,
                name: undefined,
                method: methods,
                proxy: true
            }, (ctx: any) => ({
                url,
                port,
                origin: ctx.request().baseUrl+uri
            }))
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public async group(routes: any) {
        await this.execGroup(routes);
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

    public subdomain(subdomain: string) {
        return {
            group: (routes: any) => {
                this.__group.subdomain.unshift(subdomain);
                this.execGroup(routes, "subdomain");
            },
        };
    }

    public hostname(hostname: string) {
        return {
            group: (routes: any) => {
                this.__group.hostname.unshift(hostname);
                this.execGroup(routes, "hostname");
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

    public beforeRoute(action:any) {
        if (!this.__request)
            throw new RouterException("the request is undefined in the router", "router");

        return action(this.__request);
    }

    public useTemplate(template: TemplateEngineService) {
        this.__template = template;
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

    set result(value: any) {
        this.__result = value;
    }

    get result() {
        return this.__result;
    }

    public async lookPetitions() {
        try {
            if (this.isProxy) return;

            const route: Route | Promise<Route> | undefined = await this.loadRoute();

            // if (route?.proxy === false || route?.proxy === undefined) this.isProxy = false;

            if (route) {
                this.__currentRoute = route;

                if (route.redirect) return route.handler();

                if (this.__history) this.__history.handleHistory(route);

                if (route.middlewares) this.__kernel.add(route.middlewares);

                if (route.proxy) this.isProxy = route.proxy;

                const action = await this.loadAction(route.handler);

                this.result = action;
            }
        } catch (exception) {
            this.__handler.report(exception)
        }
    }
}
