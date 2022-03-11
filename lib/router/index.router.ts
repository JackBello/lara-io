import { IRoute, ISettingRoute } from '../@types/interfaces/router.interface.ts';
import { TCallbackRoute, TCallbackGroup  } from '../@types/types/router.type.ts';

export default class Router {
    protected __routes: Array<IRoute> = [];
    protected __request: Request | undefined;
    protected __pattern: URLPattern | undefined;
    protected __handleError: undefined;
    public name = "service-router";

    protected validateAddRoute() {

    }

    protected registerRoute() {

    }

    protected async registerRoutes(routes:string): Promise<void> {
        await import(routes);
    }

    public async group(routes: string | TCallbackGroup) {
        if (typeof routes === "string") {
            await this.registerRoutes(routes);
            return;
        } else {
            routes();
            return
        }
    }

    public add(setting: ISettingRoute, callback: TCallbackRoute) {
        const {
            uri,
            method,
            middleware,
            name,
            pattern
        } = setting;

        if (!uri) throw new Error('uri must be given');
        if (!method) throw new Error('method must be given');
        if (!callback) throw new Error('callback must be given');

        if(typeof uri !== "string") throw new TypeError('typeof uri must be a string');
        if(typeof method !== "string" || Array.isArray(method)) throw new TypeError('typeof uri must be a string');
        if(typeof callback !== "function") throw new TypeError('typeof callback must be a function');

        this.__routes.forEach(route => {
            if (route.uri === uri && route.method === method) throw new Error(`the uri ${route.uri} already exists with this method ${route.method}`);
        });
        
        const route: IRoute = {
            uri,
            method,
            middleware,
            name,
            pattern,
            controller: callback
        }

        this.__routes.push(route);
    }

    public handlerPetition (request: Request) {
        this.__request = request;
        this.__pattern = new URLPattern(request.url);
    }

    public init(): Promise<Response> | Response | string {
        let patter: URLPattern, request: Request;
        
        if (!this.__pattern) throw new Error("the path undefined");
        else patter = this.__pattern;

        if (!this.__request) throw new Error("the request undefined");
        else request = this.__request;

        const resolve: IRoute[] = [];

        this.__routes.forEach(route => {
            const regEx = new RegExp(`^${route.uri}$`);

            if (!patter.pathname.match(regEx)) return `This url ${route.uri} no exist to router`;

            if (request.method !== route.method) return `This method ${request.method} is not support in this route ${route.uri}`
            
            resolve.push(route);
        });

        const route: IRoute = resolve[0];

        console.log(route);
        

        return route.controller(request);
    }
}