// deno-lint-ignore-file no-explicit-any
export interface IProviders {
    name: string;
    instance: any;
}

export interface IServices {
    name: string;
    instance: any;
}

export interface IAlias {
    alias: string;
    instance?: any;
    service?: string;
}

export interface IConfigs {
    name: string;
    instance: any;
}

export interface ITypeAliases {
    fecades: IAlias[];
    services: IAlias[];
    helpers: IAlias[];
}

export interface IAppPaths {
    services?: string;
    providers?: string;
    models?: string;
    mails?: string;
    http?: string;
    fecades?: string;
    helpers?: string;
    queries?: string;
    exceptions?: string;
    handlers?: string;
    [key: string]: string | undefined;
}

export interface IPath {
    app?: string;
    configs?: string;
    assets?: string;
    statics?: string;
    storage?: string;
    resources?: string;
    database?: string;
    packages?: string;
    ecosystems?: string;
    router?: string;
    [key: string]: string | undefined;
}

export interface IAppConfig {
    name: any;
    app: IAppPaths;
    paths: IPath;
    providers: IProviders[];
    services: IServices[];
    aliases: ITypeAliases;
    configs: Array<any>;
    isDebug: boolean;
}