// deno-lint-ignore-file no-explicit-any
import { presetMiddleware } from './presets/middleware.ts';

export default async function make(type: string, name: string | undefined, path: string, flags: any) {
    if (type === "middleware") {
        const preset = presetMiddleware(name, flags.type ?? "default");

        let parseName = name?.toLowerCase();
        if (parseName?.indexOf("middleware") !== -1 || parseName?.indexOf("Middleware") !== -1) parseName = parseName?.replace(/(middleware|Middleware)/g, ".middleware.ts");
        else parseName = parseName.concat(".middleware.ts");

        await Deno.writeTextFile(`${path}/app/http/middlewares/${parseName}`, preset);
    }
}
