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

export interface IPath {
    app: string;
    assets?: string;
    statics?: string;
    storage?: string;
    resources?: string;
    database?: string;
    ecosystems?: string;
    router?: string;
}

export interface IAppConfig {
    name: string;
    paths: IPath;
    providers: IProviders[];
    services: IServices[];
    aliases: ITypeAliases;
    configs: Array<any>;
    isDebug: boolean;
}