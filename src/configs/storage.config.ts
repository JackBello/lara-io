import { IStorage } from "../../lib/@types/interfaces/storage.interface.ts";
import { Storage } from "@lara-io/fecades";

export default (): IStorage => ({
  disks: {
    local: {
      driver: "local",
      root: Storage.storage_path("app"),
    },

    public: {
      driver: "local",
      root: Storage.storage_path("app/public"),
    },

    works: {
      driver: "local",
      root: Storage.storage_path(),
    },
  },

  /**
   * Symbolic Links
   */
  links: [
    {
      path_old: Storage.public_path("storage"),
      path_new: Storage.storage_path("app/public"),
    },
  ],
});
