// deno-lint-ignore-file no-explicit-any
import serveWatch from "./serve-watch.ts";

export default async function serve(path: string, flags: any) {
    const { watch } = flags;

    if (watch) {
        serveWatch(path);
    } else {
        const proccess = Deno.run({
            cmd: [
                "deno",
                "run",
                "-c",
                `${path}\\tsconfig.json`,
                "--allow-read",
                "--allow-write",
                "--allow-net",
                "--allow-env",
                "--import-map",
                `${path}\\imports.json`,
                `${path}\\src\\main.ts`,
            ],
        });

        const { code } = await proccess.status();

        if (code !== 0) {
            console.log("Error run serve");
        }
    }
}
