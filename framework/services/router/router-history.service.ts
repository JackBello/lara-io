// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

import Route from './route.ts'

import { IHistoryRoute } from '../../@types/route.ts';
import { TResponse } from '../../@types/server.ts';

export class RouterHistoryService extends Service {
    protected __previusRouteHistory: IHistoryRoute[] = [];
    protected __currentRouteHistory: IHistoryRoute[] = [];
    protected __nextsRouteHistory: IHistoryRoute[] = [];
    protected __cacheHistory: IHistoryRoute[] = [];
    protected __url: string = "";

    public handleHistory = (route: Route, cache: boolean = false): void => {
        if (this.__currentRouteHistory.length === 0) {
            if (cache) {
                this.__cacheHistory.push({
                    uri: route.uri,
                    name: route.name,
                });
            }

            this.__currentRouteHistory.push({
                uri: route.uri,
                name: route.name,
            });
        }

        if (this.__currentRouteHistory.length !== 0) {
            this.__previusRouteHistory.push(this.__currentRouteHistory[0]);

            this.__currentRouteHistory.pop();

            if (cache) {
                this.__cacheHistory.push({
                    uri: route.uri,
                    name: route.name,
                });
            }

            this.__currentRouteHistory.push({
                uri: route.uri,
                name: route.name,
            });
        }
    }

    public clearHistory(): void {
        this.__previusRouteHistory = [];
        this.__currentRouteHistory = [];
        this.__nextsRouteHistory = [];
    }

    public clearCacheHistory(): void {
        this.__cacheHistory = [];
    }

    public setUrl(url: string): void {
        this.__url = url;
    }

    public redirect(uri?: string, status: number = 302): TResponse {
        if (uri) {
            let backslash: string;

            const urlPattern = new URLPattern(this.__url);

            if (uri.slice(0, 1) === "/") backslash = "";
            else backslash = "/";

            return Response.redirect(`${urlPattern.protocol}:\\${urlPattern.hostname}${backslash}${uri}`, status);
        }
    }

    public back(cache: boolean = false): TResponse {
        if (this.__previusRouteHistory.length === 0) return;

        this.__nextsRouteHistory.unshift(this.__currentRouteHistory[0]);

        this.__currentRouteHistory.pop();

        if (cache) {
            this.__cacheHistory.push(this.__previusRouteHistory[this.__previusRouteHistory.length - 1]);
        }

        this.__currentRouteHistory.push(this.__previusRouteHistory[this.__previusRouteHistory.length - 1]);

        this.__previusRouteHistory.pop();

        return Response.redirect(`${this.__url}${this.__currentRouteHistory[0].uri}`, 200);
    }

    public next(cache: boolean = false): TResponse {
        if (this.__nextsRouteHistory.length === 0) return;

        this.__previusRouteHistory.push(this.__currentRouteHistory[0]);

        this.__currentRouteHistory.pop();

        if (cache) {
            this.__cacheHistory.push(this.__nextsRouteHistory[0]);
        }

        this.__currentRouteHistory.push(this.__nextsRouteHistory[0]);

        this.__nextsRouteHistory.shift();

        return Response.redirect(`${this.__url}${this.__currentRouteHistory[0].uri}`, 200);
    }

    get cacheHistory(): IHistoryRoute[] {
        return this.__cacheHistory;
    }

    get history(): Array<IHistoryRoute[]> {
        return [this.__previusRouteHistory, this.__currentRouteHistory, this.__nextsRouteHistory];
    }

    get currentRoute(): IHistoryRoute {
        return this.__currentRouteHistory[0];
    }
}
