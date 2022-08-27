// deno-lint-ignore-file no-explicit-any
import "https://deno.land/std@0.153.0/dotenv/load.ts";

import { Path } from '../dependencies.ts';

import RouteException from '../foundation/exceptions/router/route.exception.ts';

// config({ debug: false })

const { dirname } = Path;

export function validateUrl (value: string) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

export function formatter(value: any) {
    if (value.startsWith("[") && value.endsWith("]")) {
        return JSON.parse(value);
    } else if (value === "undefined") {
        return undefined;
    } else if (value === "true" || value === "false") {
        return Boolean(value);
    } else if (isNaN(Number(value))) {
        if (String(value).startsWith("\"") && String(value).endsWith("\"")) {
            return String(value).slice(1,-1);
        } else if (String(value).startsWith("\'") && String(value).endsWith("\'")) {
            return String(value).slice(1,-1);
        } else {
            return String(value);
        }
    } else {
        return Number(value);
    }
}

export function abort(status: number, message?: string) {
    if (message) throw new RouteException(message, `route/http/${status}`);
    else throw new RouteException("", `route/http/${status}`);
}

export function isClass(abstract: any) {
    if (typeof abstract === "function") {
        if (abstract.toString().indexOf("class") !== -1) return true;
        else return false;
    } else return false;
}

export function useFacade(facade: any) {
    return new facade();
}

export function env (key: string, auto: any): any {
    const resolve = Deno.env.get(key);

    if (resolve) return formatter(resolve)

    return auto;
}

export function envHas(key: string): boolean {
    if (Deno.env.get(key)) return true;
    else return false;
}

export function getBasePath(path: string, isImport = true): string {
    if (isImport) return `file:///${Deno.cwd()}${path.startsWith("/") ? path : "/"+path}`.replace(/\\/g, "/");
    return `${Deno.cwd()}${path.startsWith("/") ? path : "/"+path}`.replace(/\\/g, "/");
}

export function getPathName(path: string): string {
    return dirname(`${Deno.cwd()}${path.startsWith("/") ? path : "/"+path}`.replace(/\\/g, "/"));
}
