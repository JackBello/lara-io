// deno-lint-ignore-file no-explicit-any
import "https://deno.land/x/dotenv@v3.2.0/load.ts";
import { Path } from '../dep.ts';

const { fromFileUrl, dirname, resolve, toFileUrl } = Path;

export function functionExist(func: any): boolean {
    if (typeof func === "undefined") return false
    return true;
}

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

export function getBasePath(path: string): string {
    return toFileUrl(`${resolve(dirname(fromFileUrl(import.meta.url)), "../../")}/${path}`).href;
}