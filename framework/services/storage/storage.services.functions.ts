import { StorageService } from "./storage.service.ts";
import { TUploadedFile } from "../../@types/request.ts";
import { Fs, Path, UUID, Streams } from "../../dependencies.ts";
import { IInfoFile } from "../../@types/storage.ts";
import { MimeTypeByExtension } from "../../fundation/http/http-mimetypes.ts";
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

export const execDownload = (
    context: StorageService,
    path: string,
    name?: string,
    headersRequest?: Array<string>,
    disk?: string
) => {
    try {
        let file: Deno.FsFile;
        let fileName: string;
        let mimetype: string;
        let fileSize: number;
        let fileExtension: string;
        const pathFile = context.path(path, disk);

        file = Deno.openSync(pathFile, { read: true });
        fileExtension = context.extension(path);
        fileName = name ? `${name}.${fileExtension}` : context.baseName(path);
        mimetype = MimeTypeByExtension[`.${fileExtension}`];
        fileSize = context.disk(disk).size(path);

        return new Response(Streams.readableStreamFromReader(file), {
            headers: {
                "Content-Type": mimetype,
                "Content-Length": fileSize.toString(),
                "Content-Disposition": `attachment; filename=${fileName}`,
            },

            status: 200,
        });
    } catch (error) {
        throw new Deno.errors.NotFound(error.message);
    }
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

export const execAppendOrPrepend = (
    context: StorageService,
    path: string,
    content: string,
    type: string,
    disk?: string
) => {
    const filePath = context.path(path, disk);
    const encoder = new TextEncoder();
    const data = encoder.encode(content + "\n");

    const fileWirite = Deno.openSync(filePath, {
        create: true,
        write: true,
        read: true,
    });
    const fileRead = Deno.readFileSync(filePath);

    const buffer = new Uint8Array(fileRead.length + data.length);

    if (type == "prepend") {
        buffer.set(data);
        buffer.set(fileRead, data.length);
    }

    if (type == "append") {
        buffer.set(fileRead);
        buffer.set(data, fileRead.length);
    }

    fileWirite.writeSync(buffer);
    fileWirite.close();
};

export const execCopy = (
    context: StorageService,
    from: string,
    to: string,
    disk?: string
): boolean => {
    try {
        const pathFrom = context.path(from, disk);
        const pathTo = context.path(to, disk);
        Deno.copyFileSync(pathFrom, pathTo);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const execMove = (
    context: StorageService,
    from: string,
    to: string,
    disk?: string
): boolean => {
    try {
        const pathFrom = context.path(from, disk);
        const pathTo = context.path(to, disk);

        Deno.renameSync(pathFrom, pathTo);
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
