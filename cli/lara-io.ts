import { Flags } from "./dependencies.ts";

import help from "./help.ts";
import route from "./route.ts";
import create from './create.ts';
import serve from './serve.ts';

const flags = Flags.parse(Deno.args, {
    boolean: ["watch","list", "help", "version"],
    alias: {
        h: "help",
        v: "version",
        w: "watch",
        l: "list"
    }
});

const action = flags._[0] ? String(flags._[0]) : undefined;
const path = Deno.cwd();
const os = Deno.build.os;

if (!action) console.error("No action specified");

if (action === "create") {
    const name = Deno.args[1];

    if (name) {
        await create(name, path, os);
    } else {
        console.error("You must specify a name for your project");
    }
} else if (action === "serve") {
    await serve(path, flags);
} else if (action === "route") {
    await route(path, flags);
} else if (action === "storage") {
    console.log("Storage");
} else {
    if (flags.version) {
        console.log(`Lara v0.0.1`);
    } else if (flags.help) {
        help(action);
    } else {
        console.error("Invalid subcommand or option");
    }
}
