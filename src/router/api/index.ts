import { Route } from '@lara-io/fecades';

Route.get("/", "", () => {
    const data = {
        name: "Deno",
        version: Deno.version.deno,
        typescript: Deno.version.typescript,
        v8: Deno.version.v8,
    }

    return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
            "Content-Type": "application/json"
        }
    })
});
