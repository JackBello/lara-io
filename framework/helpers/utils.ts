// deno-lint-ignore-file no-explicit-any
import { config } from "https://raw.githubusercontent.com/daychongyang/dotenv/master/mod.ts";

config({ debug: false })

import { Path } from '../dependencies.ts';

const { dirname } = Path;

export function useFacade(facade: any): any {
    return new facade();
}

export function env (key: string, auto: any): any {
    const resolve = Deno.env.get(key);

    if (resolve) {
        if (resolve.startsWith("true") || resolve.startsWith("false")) {
            return Boolean(resolve);
        } else if (!isNaN(Number(resolve))) {
            return Number(resolve);
        } else {
            return resolve;
        }
    }

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
