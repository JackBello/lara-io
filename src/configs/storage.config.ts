import { IStorage } from "../../lib/@types/interfaces/storage.interface.ts";
// import { Storage } from "@lara-io/fecades";
import { env } from "@lara-io/utils";
export default (): IStorage => ({
  disks: {
    local: {
      driver: "local",
      root: "",
      // root: Storage.public_path(),
    },

    public: {
      driver: "local",
      // root: Storage.storage_path("app/public"),
      url: `${env("APP_URL", "http://localhost")}/storage/`,
      root: "",
    },

    works: {
      driver: "local",
      root: "",
      // root: Storage.storage_path(),
    },
  },

  default: "local",

  /**
   * Symbolic Links
   */
  links: [
    {
      path_old: "",
      path_new: "",
      // path_old: Storage.public_path("storage"),
      // path_new: Storage.storage_path("app/public"),
    },
  ],
});
