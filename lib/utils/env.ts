import "https://deno.land/x/dotenv@v3.2.0/load.ts";

export default function env (key: string, auto: string): string | number | boolean {
    const resolve = Deno.env.get(key);

    if (resolve) return resolve;
    else return auto;
}

export function envHas(key: string): boolean {
    if (Deno.env.get(key)) return true;
    else return false;
}