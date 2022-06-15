export default async function serveWatch(path: string) {
    const watcher = Deno.watchFs(`${path}\\src`);

    let proccess = Deno.run({
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

    for await (const event of watcher) {
        event;
        // console.log(">>>> event", event);

        Deno.close(proccess.rid);

        proccess = Deno.run({
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
    }

    const { code } = await proccess.status();

    if (code !== 0) {
        console.log("Error run serve");
    }
}
