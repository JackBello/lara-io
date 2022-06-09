import { StorageService } from "./storage.service.ts";
import { TUploadedFile } from "../../@types/request.ts";
import { Fs, Path, UUID } from "../../dependencies.ts";
import { IInfoFile } from "../../@types/storage.ts";
export const execExists = (
    context: StorageService,
    path: string,
    disk?: string
): boolean => {
    try {
        const file = Deno.openSync(context.path(path, disk));
        if (file instanceof Deno.FsFile) return true;
        else return false;
    } catch (e) {
        return false;
    }
};

export const execGet = (
    context: StorageService,
    path: string,
    disk?: string
): string => {
    try {
        const decoder = new TextDecoder("utf-8");
        const filePath = context.path(path, disk);
        const data = Deno.readFileSync(filePath);
        return decoder.decode(data);
    } catch (error) {
        throw new Deno.errors.NotFound(error.message);
    }
};

export const execPut = (
    context: StorageService,
    path: string,
    contents: Uint8Array,
    disk?: string
): boolean => {
    try {
        const filePath = context.path(path, disk);

        if (contents) Deno.writeFileSync(filePath, contents);

        return true;
    } catch (error) {
        console.log(error.message);
        return false;
    }
};

export const execPutFile = (
    context: StorageService,
    path: string,
    contents: TUploadedFile,
    disk?: string
): string | false => {
    try {
        const fileName = `${UUID.uuid()}.${contents.extension}`;

        return execPutFileFileAs(context, path, contents, fileName, disk);
    } catch (error) {
        console.log(error);
        return "error";
    }
};

export const execPutFileFileAs = (
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

        return execPut(context, filePath, fileContent, disk)
            ? `${directoryPath}/${name}`
            : false;
    } catch (error) {
        console.log(error);
        return "error";
    }
};

export const execDelete = (
    context: StorageService,
    path: string | Array<string>,
    disk?: string
): boolean => {
    const paths = Array.isArray(path) ? path : [path];
    let success = true;
    paths.forEach((currentPath) => {
        try {
            const filePath = context.path(currentPath, disk);

            Deno.removeSync(filePath);
        } catch (error) {
            success = false;
            console.log("error", error);
        }
    });
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

export const execFileInfo = (
    context: StorageService,
    path: string,
    disk?: string
): Deno.FileInfo => {
    try {
        const filePath = context.path(path, disk);
        const file = Deno.openSync(filePath);
        return Deno.fstatSync(file.rid);
    } catch (error) {
        if (error instanceof Deno.errors.NotFound)
            throw new Deno.errors.NotFound(error.message);
        if (error instanceof Deno.errors.PermissionDenied)
            throw new Deno.errors.PermissionDenied(error.message);

        throw new Deno.errors.NotFound(error.message);
    }
};
