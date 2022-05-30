import { config } from './miscellaneous.ts';
import { getBasePath } from '../helpers/utils.ts';

let paths;

export function appPath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.app}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.app}${path.startsWith("/") ? path : "/"+path}`, false);
}

export function publicPath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.statics}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.statics}${path.startsWith("/") ? path : "/"+path}`, false);
}

export function configPath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.config}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.config}${path.startsWith("/") ? path : "/"+path}`, false);
}

export function resourcePath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.resources}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.resources}${path.startsWith("/") ? path : "/"+path}`, false);
}

export function routerPath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.router}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.router}${path.startsWith("/") ? path : "/"+path}`, false);
}

export function databasePath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.database}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.database}${path.startsWith("/") ? path : "/"+path}`, false);
}

export function ecosystemPath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.ecosystems}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.ecosystems}${path.startsWith("/") ? path : "/"+path}`, false);
}

export function storagePath(path: string, relative = false): string {
    paths =  config("paths");
    if (relative) return `${paths.storage}${path.startsWith("/") ? path : "/"+path}`;
    return getBasePath(`${paths.storage}${path.startsWith("/") ? path : "/"+path}`, false);
}
