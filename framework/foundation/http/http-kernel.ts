// deno-lint-ignore-file no-explicit-any no-inferrable-types
import { Application } from '../application.ts';
import { RouterService } from '../../services/router/router.service.ts';
import { isClass } from '../../helpers/utils.ts';
import { injectPropertiesToController, injectParamsToController } from '../dependency-injection.ts';

import { startMiddleware } from './middlewares/start.middleware.ts'
export class HttpKernel {
    private __app?: Application;
    private __router?: RouterService;

    protected middleware: any[] = [
        startMiddleware
    ];
    protected middlewareGroups: any = {};
    protected routeMiddleware: any = {};
    protected middlewarePriority: any[] = [];

    set router(router: RouterService) {
        this.__router = router;
    }

    get router(): RouterService {
        if (!this.__router) throw new Error('Router is not set.');

        return this.__router;
    }

    set application(app: Application) {
        this.__app = app;
    }

    get application(): Application {
        if (!this.__app) throw new Error('Application is not set.');

        return this.__app;
    }

    private params: Record<string, any> = {};
    private stack: any[] = [];
    private route: any[] = [];

    private _result_: any;
    private _context_: any;

    private _loading_: boolean = false;

    get excuting() {
        return this._loading_;
    }

    set excuting(value: boolean) {
        this._loading_ = value;
    }

    get result() {
        return this._result_;
    }

    set result(value: any) {
        this._result_ = value;
    }

    public appendMiddleware(middleware: any) {
        this.middleware.push(middleware);

        this.mergeMiddlewares();
    }

    public preppendMiddleware(middleware: any) {
        this.middleware.unshift(middleware);

        this.mergeMiddlewares();
    }

    public appendMiddlewarePriority(middleware: any) {
        this.middlewarePriority.push(middleware);
    }

    public preppendMiddlewarePriority(middleware: any) {
        this.middlewarePriority.unshift(middleware);
    }

    public addMiddlewareRoute(name: string, middleware: any) {
        this.routeMiddleware[name] = middleware;
    }

    public addMiddlewareGroup(name: string, middleware: any) {
        this.middlewareGroups[name] = middleware;
    }

    public getMiddleware() {
        return this.middleware;
    }

    public getMiddlewareRoute() {
        return this.routeMiddleware;
    }

    public getMiddlewareGroups() {
        return this.middlewareGroups;
    }

    public getMiddlewarePriority() {
        return this.middlewarePriority;
    }

    public clearMiddlewares() {
        this.result = undefined;
        this.route = [];
        this.stack = [];
    }

    public existsMiddlewares() {
        return this.stack.length > 0;
    }

    public setContext(context: any) {
        this._context_ = context;
    }

    public add(middleware: any) {
        if (typeof middleware === "string" || typeof middleware === "function") {
            this.stack.push(middleware);
        } else if (Array.isArray(middleware)) {
            this.stack.push(...middleware);
        }
    }

    public mergeMiddlewares() {
        if (this.middleware.length > 0) {
            this.stack.push(...this.middleware);
        }
    }

    protected prepareStack() {
        let index = 0;

        for(const middleware of this.stack) {
            if (typeof middleware === "string") {
                let params: any = [];
                let nameMiddleware;
                let execMiddlewares;

                if (middleware.indexOf(":") !== -1) {
                    params = middleware.split(":")[1].split(",");
                    nameMiddleware = middleware.split(":")[0];
                } else nameMiddleware = middleware

                if (this.routeMiddleware[nameMiddleware]) execMiddlewares = this.routeMiddleware[nameMiddleware];

                if (this.middlewareGroups[nameMiddleware]) execMiddlewares = this.middlewareGroups[nameMiddleware];

                if (Array.isArray(execMiddlewares)) this.route.push([...execMiddlewares])
                else this.route.push(execMiddlewares);

                if (params.length > 0) this.params[`${index}`] = params;
            } else {
                this.route.push(middleware);
            }

            index++;
        }
    }

    public async run() {
        this.prepareStack();

        await this.execute(0, this.route);
    }

    public async execute(index: number, middlewares: any, params: any = undefined) {
        let previusIndex = -1;

        if (index === previusIndex) {
            throw new Error('next() called multiple times');
        }

        const middleware = middlewares[index];

        const next = async () => {
            previusIndex = index;
            return await this.execute(index + 1, middlewares);
        }

        let action, defaultParams;

        if (middleware) {
            if (params) defaultParams = params;
            else defaultParams = this.params[`${index}`];

            defaultParams = Array.isArray(defaultParams) ? defaultParams : [];

            if (typeof middleware === "function") {
                if (isClass(middleware)) {
                    const middlewareClass = new middleware();

                    injectPropertiesToController(middlewareClass);

                    const dependencies: any[] = injectParamsToController(middlewareClass, "handle").filter(dependency => dependency !== undefined)

                    if (dependencies.length > 0) action = await middlewareClass.handle(...dependencies, next, defaultParams);
                    else action = await middlewareClass.handle(next, defaultParams);
                } else {
                    action = await middleware(this._context_, next, defaultParams);
                }
            } else if (Array.isArray(middleware)) {
                await this.execute(0, middleware, defaultParams);
            }

            if (action) {
                this.result = action;
                this.excuting = true;
            }
        } else {
            previusIndex = -1;
            this.result = undefined;
            this.excuting = false;
            this.route = [];
        }
    }
}
