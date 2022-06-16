// deno-lint-ignore-file no-explicit-any
import { IRouterFile, IRouteConfig, IHistoryRoute, IRoute, TAction, TMiddleware } from '../@types/route.ts';
import { TUploadedFile, TRequestServer } from '../@types/request.ts';
import { IAppPaths, IPath, IProviders, IServices, IConfigs } from '../@types/application.ts';
import { TMethodHTTP, TAllMethodHTTP } from '../@types/server.ts';
import { IInfoFile, IDisks, ILinks } from "../@types/storage.ts"

export type TRouteContext = {
    [index: string]: any;
    request: THttpRequest;
    history: THistory;
    view(view: string, data?: any): Promise<string>,
    config(name: string): void;
    service(name: string): void;
}

export type THttpRequest = {
    [index: string]: any;
    isMethod(method: string): boolean;
    hasHeader(name: string): boolean;
    hasAccepts(type: string): boolean;
    hasBody(key: string): boolean;
    hasQuery(key: string): boolean;
    hasParam(key: string): boolean;
    hasFiles(key: string): boolean;
    getInputBody(key: string, defaultValue?: any): any;
    getInputQuery(key: string, defaultValue?: any): any;
    getInputParam(key: string, defaultValue?: any): any;
    onlyBody(...keys: string[]): any;
    onlyQuery(...keys: string[]): any;
    onlyParams(...keys: string[]): any;
    onlyFiles(...keys: string[]): any;
    exceptBody(...keys: string[]): any;
    exceptQuery(...keys: string[]): any;
    exceptParams(...keys: string[]): any;
    exceptFiles(...keys: string[]): any;
    whenHasBody(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void;
    whenHasQuery(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void;
    whenHasParam(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void;
    whenHasFiles(key: string, callback: (value: any) => any, callbackNotFound?: () => any): void;
    accepts: string[];
    bearerToken: string;
    headers: Record<string, string>;
    query: Record<string, string>;
    params: Record<string, string>;
    route: IRoute;
    body: any;
    files: Record<string, TUploadedFile>;
    cookies: any;
    server?: TRequestServer;
    session?: any;
    user?: any;
    method: TAllMethodHTTP;
    ip: string;
    baseUrl: string;
    baseUri: string;
    fullUrl: string;
}

export type THttpResponse = {

}

export type THistory = {
    clearHistory(): void;
    clearCacheHistory(): void;
    redirect(url: string, status: number): void;
    back(): void;
    next(): void;
    cacheHistory: IHistoryRoute[],
    history: Array<IHistoryRoute[]>,
    currentRoute: IHistoryRoute,
}

export type TRouter = {
    get: (uri: string, name: string, action: TAction, middleware?: TMiddleware) => void;
    post: (uri: string, name: string, action: TAction, middleware?: TMiddleware) => void;
    put: (uri: string, name: string, action: TAction, middleware?: TMiddleware) => void;
    delete: (uri: string, name: string, action: TAction, middleware?: TMiddleware) => void;
    patch: (uri: string, name: string, action: TAction, middleware?: TMiddleware) => void;
    match: (methods: TMethodHTTP, uri: string, name: string, action: TAction, middleware?: TMiddleware) => void;
    any: (uri: string, name: string, action: TAction, middleware?: TMiddleware) => void;

    middleware: (middleware: any) => TRouter;
    controller: (controller: any) => TRouter;
    domain: (domain: string) => TRouter;
    prefix: (prefix: string) => TRouter;
    name: (name: string) => TRouter;
    group: (action: any) => Promise<void>;

    redirect: (url: string, destination: string, code?: number) => any;
    permanentRedirect: (uri: string, destination: string) => any;

    view: (uri: string, view: string, data?: any) => Promise<void>;
}

export type TStorage = {
    exists: (path: string) => boolean;
    missing: (path: string) => boolean;
    get: (path: string) => string;
    put: (path: string, contents: Uint8Array) => boolean;
    putFile: (path: string, contents: TUploadedFile) => string
    putFileAs: (path: string, contents: TUploadedFile, name: string) => string
    delete: (path: string | Array<string>) => boolean
    path: (path: string) => string;
    url: (path: string) => string;
    info: (path: string) => IInfoFile;
    name: (path: string) => string;
    baseName: (path: string) => string;
    dirName: (path: string) => string;
    extension: (path: string) => string;
    fileInfo(path: string): Deno.FileInfo;
    size(path: string): number;
    lastModified(path: string): Date | null;
    lasAccessed(path: string): Date | null;
    creationDate(path: string): Date | null;
    isDirectory(path: string): boolean;
    isFile(path: string): boolean;
    isSymlink(path: string): boolean;
    disk: (name?: string | null) => TStorage;
}

export type TTemplate = {
    render(html: string, data?: any): Promise<string>,
    view(view: string, data?: any): Promise<string>,
    share(values: any): void,
    registerEngine(name: string, engine: any): void,
    registerHelper(name: string, helper: any): void,
    registerFecace(name: string, fecace: any): void,
    registerGlobal(name: string, value: any): void,
}

export type ApplicationConfig = {
    name: string;
    app: IAppPaths;
    paths: IPath;
    providers: IProviders[];
    services: IServices[];
    configs: IConfigs[];
    isDebug: boolean;
}

export type RouterConfig = {
    strict: boolean;
    indexes: boolean;
    files?: Array<IRouterFile>;
    routes?: Array<IRouteConfig>;
}

export type ServerConfig = {
    port: number;
    hostname: string;
    transport: string,
    certFile?: string,
    keyFile?: string,
    protocols?: string[],
}

export type StorageConfig = {
    disks: IDisks;
    links: ILinks[];
    default: string;
}
