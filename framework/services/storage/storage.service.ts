import { Service } from "../services.ts";
import { StorageDiskModule } from "./storage-disk.module.ts";
import { Fs } from "../../dependencies.ts";
import { ILinks, IDisk, IInfoFile } from "../../@types/storage.ts";

import { TUploadedFile } from "../../@types/request.ts";
import {
    execDelete,
    execPut,
    execPutFile,
    execPutFileFileAs,
    execExists,
    execGet,
    execUrl,
    execInfo,
    execFileInfo,
} from "./storage.services.functions.ts";
export class StorageService extends Service {
    protected __disks = new StorageDiskModule(this.app);

    protected device: IDisk = { driver: "", root: "", url: "" };

    /**
     * Initialize the storage service.
     */
    public initStorage(): void {
        const configStorage = this.app.config("storage");

        const symLinks = configStorage.links;
        this.createSymLink(symLinks);

        this.device = this.__disks.disk();
    }

    /**
     *
     * @param {Array<ILinks>} links
     * @returns {void}
     */
    public createSymLink(links: Array<ILinks>): void | Response {
        try {
            links.forEach((link) => {
                Fs.ensureSymlinkSync(link.path_new, link.path_old);
            });
        } catch (e) {
            console.error(e);
            return new Response("Error when creating the symbolic links. ", {
                status: 404,
            });
        }
    }
    /**
     * Get the disk.
     *
     * @param diskName {string}
     */
    public disk(diskName?: string) {
        return {
            delete: (path: string | Array<string>): boolean =>
                execDelete(this, path, diskName),

            put: (path: string, contents: Uint8Array): boolean =>
                execPut(this, path, contents, diskName),

            putFile: (path: string, contents: TUploadedFile): string | false =>
                execPutFile(this, path, contents, diskName),

            putFileAs: (
                path: string,
                contents: TUploadedFile,
                nameFile: string
            ): string | false =>
                execPutFileFileAs(this, path, contents, nameFile, diskName),

            exists: (path: string): boolean => execExists(this, path, diskName),

            get: (path: string): string => execGet(this, path, diskName),

            url: (path: string): string => execUrl(this, path, diskName),

            info: (path: string): IInfoFile => execInfo(this, path, diskName),

            name: (path: string): string => execInfo(this, path, diskName).name,

            baseName: (path: string): string =>
                execInfo(this, path, diskName).base,

            dirName: (path: string): string =>
                execInfo(this, path, diskName).dir,

            extension: (path: string): string =>
                execInfo(this, path, diskName).ext.replace(".", ""),

            fileInfo: (path: string): Deno.FileInfo =>
                execFileInfo(this, path, diskName),

            size: (path: string): number =>
                execFileInfo(this, path, diskName).size,

            lastModified: (path: string): Date | null =>
                execFileInfo(this, path, diskName).mtime,

            lasAccessed: (path: string): Date | null =>
                execFileInfo(this, path, diskName).atime,

            creationDate: (path: string): Date | null =>
                execFileInfo(this, path, diskName).birthtime,

            isDirectory: (path: string): boolean =>
                execFileInfo(this, path, diskName).isDirectory,

            isFile: (path: string): boolean =>
                execFileInfo(this, path, diskName).isFile,

            isSymlink: (path: string): boolean =>
                execFileInfo(this, path, diskName).isSymlink,
        };
    }

    /**
     * Get current disk.
     *
     * @param {string} disk
     * @returns {IDisk}
     */
    public getCurrentDisk(disk?: string): IDisk {
        if (disk) return this.__disks.disk(disk);
        else return this.__disks.get(this.__disks.getDefaultDisk());
    }

    /**
     * Get absolute file path.
     *
     * @param {string} path
     * @returns {string}
     */
    public path(path: string, disk?: string): string {
        if (disk) this.device = this.getCurrentDisk(disk);
        else this.device = this.getCurrentDisk();

        return `${this.device.root}/${path}`;
    }

    /**
     * Check if the file exists.
     *
     * @param {string} path
     * @returns {boolean}
     */
    public exists(path: string): boolean {
        return execExists(this, path);
    }

    /**
     * Determine if a file or directory is missing.
     *
     * @param path {string}
     * @returns {boolean}
     */
    public missing(path: string): boolean {
        return !this.exists(path);
    }

    /**
     * Get the content of a file
     *
     * @param path {string}
     * @returns {string}
     */
    public get(path: string): string {
        return execGet(this, path);
    }

    public put(path: string, contents: Uint8Array): boolean {
        return execPut(this, path, contents);
    }

    public putFile(path: string, contents: TUploadedFile): string | false {
        return execPutFile(this, path, contents);
    }

    // contents: HttpUploadedFile,
    public putFileAs(
        path: string,
        contents: TUploadedFile,
        name: string
    ): string | false {
        return execPutFileFileAs(this, path, contents, name);
    }

    public delete(path: string | Array<string>): boolean {
        return execDelete(this, path);
    }

    /**
     * Concatenate a path to a URL.
     *
     * @param {string} url
     * @param {string} path
     * @returns {string}
     */

    public concatPathToUrl(url: string | any, path: string): string {
        if (url.slice(url.length - 1) == "/") url = url.slice(0, -1);

        if (path.slice(0, 1) == "/") path = path.slice(1, path.length);

        return `${url}/${path}`;
    }

    /**
     * Get the URL for the file at the given path.
     *
     * @param {string} path
     * @returns {string}
     */
    public url(path: string): string {
        return execUrl(this, path);
    }

    /**
     * Extract the file info from a file path.
     *
     * @param  {string} path
     * @returns {InfoFile}
     */
    public info(path: string): IInfoFile {
        return execInfo(this, path);
    }

    /**
     * Extract the file name from a file path.
     *
     * @param  {string} path
     * @returns  {string}
     */
    public name(path: string): string {
        return this.info(path).name;
    }

    /**
     * Extract the basename from a file path.
     *
     * @param  {string} path
     * @returns  {string}
     */
    public baseName(path: string): string {
        return this.info(path).base;
    }

    /**
     * Extract the directory name of a path.
     *
     * @param  {string} path
     * @returns  {string}
     */
    public dirName(path: string): string {
        return this.info(path).dir;
    }

    /**
     * Extract the file extension from a file path.
     *
     * @param  {string} path
     * @returns  {string}
     */
    public extension(path: string): string {
        return this.info(path).ext.replace(".", "");
    }

    /**
     * Extract the file file info from a file path.
     * @param  {string} path
     * @returns {Deno.FileInfo}
     */
    public fileInfo(path: string): Deno.FileInfo {
        return execFileInfo(this, path);
    }

    /**
     * Get the file size of a file.
     *
     * @param {string} path
     * @returns {number}
     */
    public size(path: string): number {
        return this.fileInfo(path).size;
    }

    /**
     *  Gets the last modification time of a file.
     *
     * @param {string} path
     * @returns {Date | null}
     */
    public lastModified(path: string): Date | null {
        return this.fileInfo(path).mtime;
    }

    /**
     * Get the las accessed time of a file.
     *
     * @param {string} path
     * @returns {Date | null}
     */
    public lasAccessed(path: string): Date | null {
        return this.fileInfo(path).atime;
    }

    /**
     * Get the creation time of a file.
     *
     * @param {string} path
     * @returns { Date | null}
     */
    public creationDate(path: string): Date | null {
        return this.fileInfo(path).birthtime;
    }

    /**
     * Determine if the path is a directory.
     *
     * @param {string} path
     * @returns {boolean}
     */
    public isDirectory(path: string): boolean {
        return this.fileInfo(path).isDirectory;
    }

    /**
     * Determine if the path is a file.
     *
     * @param {string} path
     * @returns {boolean}
     */
    public isFile(path: string): boolean {
        return this.fileInfo(path).isFile;
    }

    /**
     * Determine if the path is a symbolic link.
     *
     * @param {string} path
     * @returns  {boolean}
     */
    public isSymlink(path: string): boolean {
        return this.fileInfo(path).isSymlink;
    }
}
