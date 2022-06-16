export function presetVSCode(path: string) {
    const folder = `${path}/.vscode`;
    const data = {
        "deno.enable": true,
        "deno.lint": true,
        "deno.unstable": true,
        "deno.importMap": "./imports.json",
    }

    Deno.mkdirSync(folder);
    Deno.writeTextFileSync(`${folder}/settings.json`, JSON.stringify(data, null, 4));
}
