import { IDisks, IDisk } from "../../@types/storage.interface.ts";
import { Application } from "../../fundation/application.ts";

export class StorageDiskModule {
  protected app: Application;
  /**
   * The object of the storage disk.
   */
  protected disks: IDisks = {};

  constructor(app: Application) {
    this.app = app;
  }

  public disk(name?: string | null): IDisk {
    name = name ? name : this.getDefaultDisk();
    return (this.disks[name] = this.get(name));
  }

  public getDefaultDisk(): string {
    return this.app.config("storage").default;
  }

  public get(name: string): IDisk {
    return this.app.config("storage").disks[name];
  }

}
