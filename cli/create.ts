import { presetEnvBasic } from './presets/env.ts';
import { presetVSCode } from './presets/vscode.ts';
import { copy } from "https://deno.land/std@0.144.0/fs/mod.ts";

async function downloadProyect() {
    const date = new Date().toISOString().split('T')[0];

    const temporalDirectory = await Deno.makeTempDir({prefix: `lara-io-${date}-`});
    const temporalFile = await Deno.makeTempFile({prefix: `lara-io-${date}-`, suffix: '.zip'});

    const request = await fetch("https://github.com/JackBello/web-lara-io/archive/refs/heads/master.zip");

    if (request.body) {
        const file = await Deno.open(temporalFile, {
            create: true,
            write: true
        });

        for await(const chunk of request.body) {
            file.write(chunk);
        }

        file.close();
    }

    return {
        temporalDirectory,
        temporalFile
    };
}

async function unzipProyect(os: string, file: string, dest: string) {
    if (os === "windows") {
        const proccess = Deno.run({
            cmd: [
                "powershell.exe",
                "Expand-Archive",
                "-Path",
                file,
                "-DestinationPath",
                dest
            ],
            stdout: "piped",
            stderr: "piped",
        });

        const { code } = await proccess.status();

        if (code !== 0) {
            console.log("Error unzipping proyect");
        }
    }
}

export default async function create(name: string, path: string, os: string) {
    const { temporalFile, temporalDirectory } = await downloadProyect();

    await unzipProyect(os, temporalFile, temporalDirectory);
    await copy(`${temporalDirectory}/web-lara-io-master`, `${path}/${name}`);

    await Deno.remove(temporalFile);
    await Deno.remove(temporalDirectory, { recursive: true });

    await Deno.writeTextFile(`${path}/${name}/.env`, presetEnvBasic(name));

    presetVSCode(`${path}/${name}`);

    const initializeGit = confirm("do you want to initialize git in this project?");

    if (initializeGit) {
        const proccess = Deno.run({
            cmd: [
                "git",
                "init",
                `${path}/${name}`
            ],
            stdout: "piped",
            stderr: "piped",
        });

        const { code } = await proccess.status();

        if (code !== 0) {
            console.log("Error initializing git");
        }
    }
}
