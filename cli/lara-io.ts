import { Flags } from "./dependencies.ts";

import help from "./help.ts";
import route from "./route.ts";
import create from './create.ts';
import serve from './serve.ts';
import make from './make.ts';

const flags = Flags.parse(Deno.args, {
    boolean: ["watch","list", "help", "version"],
    string: ["type"],
    alias: {
        h: "help",
        v: "version",
        w: "watch",
        l: "list"
    }
});

const action = flags._[0] ? String(flags._[0]) : undefined;
const sub = flags._[1] ? String(flags._[1]) : undefined;
const path = Deno.cwd();
const os = Deno.build.os;

if (action === "create") {
    const name = sub

    if (name) {
        await create(name, path, os);
    } else {
        console.error("You must specify a name for your project");
    }
} else if (action?.startsWith("make")) {
    const type = action.split(":")[1];
    if (type) await make(type, sub, path, flags);
    else console.error("No type specified");
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
        if (!action) console.error("No action specified");
        else console.error("Invalid subcommand or option");
    }
}
