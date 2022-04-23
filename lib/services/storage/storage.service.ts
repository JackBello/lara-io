import { Service } from "../services.ts";
import { getPathName, env } from "../../utils/index.ts";
import { Fs } from "../../dep.ts";
import { ILinks } from "../../@types/interfaces/storage.interface.ts";

export class StorageService extends Service {
  public path = "";
  public pathStorage = "";

  public createSymLink(links: Array<ILinks>): void {
    links.forEach((link) => {
      Fs.ensureSymlinkSync(link.path_new, link.path_old);

    });
  }

  public storage_path(path?: string): string {
    if (path) return getPathName(`src/storage/${path}`);
    else return getPathName("src/storage/app");
  }

  public public_path(path?: string): string {
    if (path) return getPathName(`src/public/${path}`);
    else return getPathName("src/public");
  }

  public initStorage(): void {
    const configStorage = this.app.config("storage");

    const symLinks = configStorage.links;
    this.createSymLink(symLinks);
  }
}
