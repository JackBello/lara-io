// deno-lint-ignore-file no-explicit-any
import { TMethodHTTP } from './server.ts';
import { TRouteContext } from '../modules/types.ts';

// interfaces

export interface IRouterFile {
    prefix?: string;
    subdomain?: string;
    path: string;
}

export interface IGroupConfig extends IGroup {
    routes: Array<IRouteConfig>;
}

export interface IRouteConfig extends IRoute {
    group?: Array<IRouteConfig>
}

export interface IGroup {
    [key: string]: any[];
}

export interface IRoute {
    uri: string,
    name?: string,
    method?: TMethodHTTP | Array<TMethodHTTP>;
    middleware?: Array<any> | any;
    regexp?: string | string[];
    dependencies?: Array<string>;
    redirect?: boolean;
    domain?: string;
    action: any;
}

export interface IHistoryRoute {
    uri: string,
    name?: string,
    meta?: any;
}

export interface ISettingRoute {
    uri?: string;
    method?: TMethodHTTP | Array<TMethodHTTP>;
    middleware?: any | Array<any>;
    regexp?: string | string[];
    name?: string;
    redirect?: boolean;
}

export interface IHistory {
    previousRoutes: Array<IHistoryRoute>;
    currentRoute: Array<IHistoryRoute>;
    nextRoutes: Array<IHistoryRoute>;
}

export type TCallbackRoute = (context: TRouteContext, ...params: any) => any;

export type TCallbackMiddleware = (context: TRouteContext, next: () => any) => any;

export type TClassMiddleware = { new(...args: any[]): any; };

export type TAction = string | any[] | TCallbackRoute;

export type TMiddleware = string | any[] | TCallbackMiddleware | TCallbackMiddleware[] | TClassMiddleware | TClassMiddleware[];
