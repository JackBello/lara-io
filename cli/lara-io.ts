import { Flags } from "./dependencies.ts";

import { Application } from "../framework/fundation/application.ts";
import { RouterService } from "../framework/services/router/router.service.ts";

import create from './create.ts';
import serve from './serve.ts';

const action = Deno.args[0];

const flags = Flags.parse(Deno.args, {
    boolean: ["watch"],
});

const path = Deno.cwd();

const os = Deno.build.os;

if (!action) console.log("No action specified");

if (action === "create") {
    const name = Deno.args[1];

    if (name) {
        await create(name, path, os);
    } else {
        console.log("You must specify a name for your project");
    }
} else if (action === "serve") {
    await serve(path, flags);
} else if (action === "route") {
    const urlPath = `file:///${path}\\src\\boot\\index.ts`.replace(/\\/g, "/");

    const app: Application = (await import(urlPath)).default;

    const router: RouterService = app.service("router");

    console.log(router);
} else {
    console.log("Invalid action");
}
