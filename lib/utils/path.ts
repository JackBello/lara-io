import { fromFileUrl, dirname, resolve, toFileUrl } from "https://deno.land/std@0.110.0/path/mod.ts";

export function getBasePath(path: string): string {
    return toFileUrl(`${resolve(dirname(fromFileUrl(import.meta.url)), "../../")}/${path}`).href;
}