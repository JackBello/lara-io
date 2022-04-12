// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

import { IRoute, IHistoryRoute } from '../../@types/interfaces/router.interface.ts';
import { TResponse, TRequest } from '../../@types/type/server.type.ts';

export class RouterHistoryService extends Service {
    protected _mode: "hash" | "history" = "history";
    protected _previusRoute: IHistoryRoute[] = [];
    protected _currentRoute: IHistoryRoute[] = [];
    protected _nextsRoute: IHistoryRoute[] = [];
    protected _cacheHistory: IHistoryRoute[] = [];
    protected _hostname: string = "";

    public handleHistory = (route: IRoute, cache: boolean = false): void => {
        if (this._currentRoute.length === 0) {
            if (cache) {
                this._cacheHistory.push({
                    uri: route.uri,
                    name: route.name,
                });
            }

            this._currentRoute.push({
                uri: route.uri,
                name: route.name,
            });
        }

        if (this._currentRoute.length !== 0) {
            this._previusRoute.push(this._currentRoute[0]);

            this._currentRoute.pop();

            if (cache) {
                this._cacheHistory.push({
                    uri: route.uri,
                    name: route.name,
                });
            }

            this._currentRoute.push({
                uri: route.uri,
                name: route.name,
            });
        }
    }

    public clearHistory(): void {
        this._previusRoute = [];
        this._currentRoute = [];
        this._nextsRoute = [];
    }

    public clearCacheHistory(): void {
        this._cacheHistory = [];
    }

    public lookRequest(request: TRequest): void {
        this._hostname = request.url;
    }

    public redirect(uri?: string, status: number = 302): TResponse {
        if (uri) {
            let backslash: string;

            if (uri.slice(0, 1) === "/") backslash = "";
            else backslash = "/";
    
            return Response.redirect(`${this._hostname}${backslash}${uri}`, status);
        }
    }

    public back(cache: boolean = false): TResponse {
        if (this._previusRoute.length === 0) return;

        this._nextsRoute.unshift(this._currentRoute[0]);

        this._currentRoute.pop();

        if (cache) {
            this._cacheHistory.push(this._previusRoute[this._previusRoute.length - 1]);
        }

        this._currentRoute.push(this._previusRoute[this._previusRoute.length - 1]);

        this._previusRoute.pop();

        return Response.redirect(`${this._hostname}${this._currentRoute[0].uri}`, 200);
    }

    public next(cache: boolean = false): TResponse {
        if (this._nextsRoute.length === 0) return;

        this._previusRoute.push(this._currentRoute[0]);

        this._currentRoute.pop();

        if (cache) {
            this._cacheHistory.push(this._nextsRoute[0]);
        }

        this._currentRoute.push(this._nextsRoute[0]);

        this._nextsRoute.shift();

        return Response.redirect(`${this._hostname}${this._currentRoute[0].uri}`, 200);
    }

    get cacheHistory(): IHistoryRoute[] {
        return this._cacheHistory;
    }

    get history(): Array<IHistoryRoute[]> {
        return [this._previusRoute, this._currentRoute, this._nextsRoute];
    }

    get currentRoute(): IHistoryRoute {
        return this._currentRoute[0];
    }

    get mode(): "hash" | "history" {
        return this._mode;
    }

    set mode(mode: "hash" | "history") {
        this._mode = mode;
    }
}