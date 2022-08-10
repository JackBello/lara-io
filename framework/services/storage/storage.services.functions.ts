import { StorageService } from "./storage.service.ts";
import { TUploadedFile } from "../../@types/request.ts";
import { Fs, Path, UUID } from "../../dependencies.ts";
import { IInfoFile } from "../../@types/storage.ts";
export const execExists = async (
    context: StorageService,
    path: string,
    disk?: string
): Promise<boolean> => {
    try {
        const file = await Deno.open(context.path(path, disk));
        if (file instanceof Deno.FsFile) return true;
        else return false;
    } catch (_e) {
        return false;
    }
};

export const execGet = async (
    context: StorageService,
    path: string,
    disk?: string
): Promise<string> => {
    try {
        const decoder = new TextDecoder("utf-8");
        const filePath = context.path(path, disk);
        const data = await Deno.readFile(filePath);
        return decoder.decode(data);
    } catch (error) {
        throw new Deno.errors.NotFound(error.message);
    }
};

export const execPut = async (
    context: StorageService,
    path: string,
    contents: Uint8Array,
    disk?: string
): Promise<boolean> => {
    try {
        const filePath = context.path(path, disk);

        if (contents) await Deno.writeFile(filePath, contents);

        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
};

export const execPutFile = async (
    context: StorageService,
    path: string,
    contents: TUploadedFile,
    disk?: string
): Promise<string | false> => {
    try {
        const fileName = `${UUID.uuid()}.${contents.extension}`;

        return await execPutFileFileAs(context, path, contents, fileName, disk);
    } catch (error) {
        console.log(error);
        return "error";
    }
};

export const execPutFileFileAs = async (
    context: StorageService,
    path: string,
    contents: TUploadedFile,
    name: string,
    disk?: string
) => {
    try {
        const directoryPath = context.path(path, disk);
        Fs.ensureDirSync(directoryPath);

        const fileContent = contents.getContent();
        const filePath = `${path}/${name}`;

        return await execPut(context, filePath, fileContent, disk)
            ? `${directoryPath}/${name}`
            : false;
    } catch (error) {
        console.log(error);
        return "error";
    }
};

export const execDelete = async (
    context: StorageService,
    path: string | Array<string>,
    disk?: string
): Promise<boolean> => {
    const paths = Array.isArray(path) ? path : [path];
    let success = true;

    for(const currentPath of paths) {
        try {
            const filePath = context.path(currentPath, disk);

            await Deno.remove(filePath);
        } catch (error) {
            success = false;
            console.log("error", error);
        }
    }

    return success;
};

export const execUrl = (
    context: StorageService,
    path: string,
    disk?: string
): string => {
    const deviceURL = context.getCurrentDisk(disk);

    if (deviceURL?.hasOwnProperty("url"))
        return context.concatPathToUrl(deviceURL.url, path);

    path = "/storage/" + path;

    if (path.includes("/storage/public")) return path.replace("/public/", "/");

    return path;
};

export const execInfo = (
    context: StorageService,
    path: string,
    disk?: string
): IInfoFile => {
    const filePath = context.path(path, disk);
    const infoFile = Path.parse(filePath);
    const { root, dir, base, ext, name } = infoFile;
    return {
        root,
        dir,
        base,
        ext,
        name,
    };
};

export const execFileInfo = async (
    context: StorageService,
    path: string,
    disk?: string
): Promise<Deno.FileInfo> => {
    try {
        const filePath = context.path(path, disk);
        const file = await Deno.open(filePath);
        return await Deno.fstat(file.rid);
    } catch (error) {
        if (error instanceof Deno.errors.NotFound)
            throw new Deno.errors.NotFound(error.message);
        if (error instanceof Deno.errors.PermissionDenied)
            throw new Deno.errors.PermissionDenied(error.message);

        throw new Deno.errors.NotFound(error.message);
    }
};
