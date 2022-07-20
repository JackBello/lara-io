export default async function serveWatch(path: string) {
    const watcher = Deno.watchFs(`${path}`);

    let proccess = Deno.run({
        cmd: [
            "deno",
            "run",
            "-c",
            `${path}\\tsconfig.json`,
            "--unstable",
            "--allow-read",
            "--allow-write",
            "--allow-net",
            "--allow-env",
            "--import-map",
            `${path}\\imports.json`,
            `${path}\\boot\\index.ts`,
        ],
    });

    for await (const event of watcher) {
        event;

        Deno.close(proccess.rid);

        proccess = Deno.run({
            cmd: [
                "deno",
                "run",
                "-c",
                `${path}\\tsconfig.json`,
                "--unstable",
                "--allow-read",
                "--allow-write",
                "--allow-net",
                "--allow-env",
                "--import-map",
                `${path}\\imports.json`,
                `${path}\\boot\\index.ts`,
            ],
        });
    }

    const { code } = await proccess.status();

    if (code !== 0) {
        console.log("Error run serve");
    }
}
