// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { Path } from '../dep.ts';

const { dirname } = Path;

export function useFacade(facade: any): any {
    return new facade();
}

export function Type(target: any, key: string|symbol): any {
    target;
    key;
}

export function Inject(target: any, key: string|symbol): any {
    target;
    key;
}

export function env (key: string, auto: string): string | number | boolean {
    const resolve = Deno.env.get(key);

    if (resolve) return resolve;
    else return auto;
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