import createProyect from './create-proyect.ts';

const action = Deno.args[0];
const path = Deno.cwd();
const os = Deno.build.os;

if (!action) console.log("No action specified");

if (action === "create") {
    const name = Deno.args[1];

    if (name) {
        await createProyect(name, path, os);
    } else {
        console.log("You must specify a name for your project");
    }
}
