import { Service } from "../services.ts";
// import { StorageDiskService } from "./storage-disk.service.ts"
import { StorageDiskModule } from "./storage-disk.module.ts";
import { getPathName, env } from "../../utils/index.ts";
import { Fs, Path, UUID } from "../../dep.ts";
import { decode } from "https://deno.land/std@0.138.0/encoding/base64.ts";
import {
  ILinks,
  IDisk,
  IInfoFile,
} from "../../@types/interfaces/storage.interface.ts";
import { TUploadedFile } from "../../@types/request.type.ts";
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

  // /**
  //  * Get the path to the storage folder.
  //  *
  //  * @param {path} path
  //  * @returns {string}
  //  */
  // public storage_path(path?: string): string {
  //   if (path) return getPathName(`src/storage/${path}`);
  //   else return getPathName("src/storage/app");
  // }

  // /**
  //  * Get the path to the public folder.
  //  *
  //  * @param {string} path
  //  * @returns {string}
  //  */
  // public public_path(path?: string): string {
  //   if (path) return getPathName(`src/public/${path}`);
  //   else return getPathName("src/public");
  // }

  /**
   * Get the disk.
   *
   * @param name {string}
   */
  public disk(name?: string) {
    // console.log("disk", name);
    // console.log("this.device", this.device);
    this.device = this.__disks.disk(name);
    return this;
  }

  /**
   * Get absolute file path.
   *
   * @param {string} path
   * @returns {string}
   */
  public path(path: string): string {
    // console.log("this.__disks.disk(name)", this.__disks.disk("public"));
    return `${this.device.root}/${path}`;
  }

  /**
   * Check if the file exists.
   *
   * @param {string} path
   * @returns {boolean}
   */
  public exists(path: string): boolean {
    try {
      const filePath = this.path(path);
      // console.log("fil222ePath", filePath);
      const file = Deno.openSync(filePath);

      if (file instanceof Deno.FsFile) return true;
      else return false;
    } catch (e) {
      console.log("error", e);
      return false;
    }
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
    try {
      const decoder = new TextDecoder("utf-8");
      const filePath = this.path(path);
      const data = Deno.readFileSync(filePath);
      return decoder.decode(data);
    } catch (error) {
      throw new Deno.errors.NotFound(error.message);
    }
  }

  public put(path: string, contents: Uint8Array): boolean {
    try {
      const filePath = this.path(path);

      if (contents) Deno.writeFileSync(filePath, contents);

      return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }

  public putFile(path: string, contents: TUploadedFile): string | false {
    try {
      const fileName = `${UUID.uuid()}.${contents.extension}`;

      return this.putFileAs(path, contents, fileName);
    } catch (error) {
      console.log(error);
      return "error";
    }
  }

  public putFileAs(
    path: string,
    contents: TUploadedFile,
    name: string
  ): string | false {
    try {
      const directoryPath = this.path(path);
      Fs.ensureDirSync(directoryPath);

      const fileContent = contents.getContent();
      const filePath = `${path}/${name}`;

      return this.put(filePath, fileContent)
        ? `${directoryPath}/${name}`
        : false;
    } catch (error) {
      console.log(error);
      return "error";
    }
  }

  public delete(path: string | Array<string>): boolean {
    const paths = Array.isArray(path) ? path : [path];
    let success = true;
    paths.forEach((currentPath) => {
      try {
        const filePath = this.path(currentPath);
        // if (!this.exists(currentPath))
        Deno.removeSync(filePath)
        // if (!Deno.removeSync(filePath)) success = false;
      } catch (error) {
        success = false;
        // throw new Deno.errors.NotFound(error.message);
      }
    });
    return success;
  }

  /**
   * Concatenate a path to a URL.
   *
   * @param {string} url
   * @param {string} path
   * @returns {string}
   */

  protected concatPathToUrl(url: string | any, path: string): string {
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
    if (this.device.hasOwnProperty("url"))
      return this.concatPathToUrl(this.device.url, path);

    path = "/storage/" + path;

    if (path.includes("/storage/public")) return path.replace("/public/", "/");

    return path;
  }

  /**
   * Extract the file info from a file path.
   *
   * @param  {string} path
   * @returns {InfoFile}
   */
  public info(path: string): IInfoFile {
    const filePath = this.path(path);
    const infoFile = Path.parse(filePath);
    const { root, dir, base, ext, name } = infoFile;
    return {
      root,
      dir,
      base,
      ext,
      name,
    };
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
    try {
      const filePath = this.path(path);
      const file = Deno.openSync(filePath);
      return Deno.fstatSync(file.rid);
    } catch (error) {
      if (error instanceof Deno.errors.NotFound)
        throw new Deno.errors.NotFound(error.message);
      if (error instanceof Deno.errors.PermissionDenied)
        throw new Deno.errors.PermissionDenied(error.message);

      throw new Deno.errors.NotFound(error.message);
    }
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
