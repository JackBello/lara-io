import { IStorage } from "../../lib/@types/interfaces/storage.interface.ts";
// import { Storage } from "@lara-io/fecades";
import { storagePath, publicPath } from "@lara-io/helpers";
import { env } from "@lara-io/utils";
export default (): IStorage => ({
  disks: {
    local: {
      driver: "local",
      root: storagePath("app"),
    },

    public: {
      driver: "local",
      root: storagePath("app/public"),
      url: `${env("APP_URL", "http://localhost")}/storage/`,
    },

    works: {
      driver: "local",
      root: storagePath("app/public/works"),
    },
  },

  default: "local",

  /**
   * Symbolic Links
   */
  links: [
    {
      path_old: publicPath("storage"),
      path_new: storagePath("app/public"),
    },
  ],
});
