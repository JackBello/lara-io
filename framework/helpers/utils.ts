// deno-lint-ignore-file no-explicit-any
import { config } from "https://raw.githubusercontent.com/daychongyang/dotenv/master/mod.ts";

import { Path } from '../dependencies.ts';

import RouteException from '../foundation/exceptions/router/route.exception.ts';

config({ debug: false })

const { dirname } = Path;

export function formatter(value: any) {
    if (value.startsWith("[") && value.endsWith("]")) {
        return JSON.parse(value);
    } else if (value === "true" || value === "false") {
        return Boolean(value);
    } else if (isNaN(Number(value))) {
        return String(value);
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
