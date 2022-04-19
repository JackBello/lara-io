// deno-lint-ignore-file no-explicit-any
import { TMethodHTTP } from '../type/server.type.ts';

interface IRouterFile {
    name: string;
    subdomain?: string;
    path: string;
    uri?: string;
}

interface IGroupConfig extends IGroup {
    routes: Array<IRouteConfig>;
}

interface IRouteConfig extends IRoute {
    group?: IGroupConfig
}

export interface IRouterConfig {
    mode: "hash" | "history";
    files: Array<IRouterFile>;
    routes?: Array<IRouteConfig>;
}

export interface IGroup {
    middleware?: Array<any> | any;
    controller?: any;
    domain?: string;
    prefix?: string;
    name?: string;
}
export interface IRoute {
    uri: string,
    name?: string,
    method?: TMethodHTTP | Array<TMethodHTTP>;
    middleware?: Array<any> | any;
    pattern?: string | string[];
    action: any;
    dependencies?: Array<string>;
}

export interface IHistoryRoute {
    uri: string,
    name?: string,
    query?: any;
    params?: any;
    meta?: any;
}

export interface ISettingRoute {
    uri?: string;
    method?: TMethodHTTP | Array<TMethodHTTP>;
    middleware?: string;
    name?: string;
    pattern?: string | string[];
    dependencies?: Array<string>;
}

export interface IHistory {
    previousRoutes: Array<IHistoryRoute>;
    currentRoute: Array<IHistoryRoute>;
    nextRoutes: Array<IHistoryRoute>;
}
