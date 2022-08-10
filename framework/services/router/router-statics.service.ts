// deno-lint-ignore-file no-inferrable-types no-explicit-any
import { Service } from '../services.ts';

import Route from './route.ts';

import { template } from '../../helpers/miscellaneous.ts';

import { serveFile } from "https://deno.land/std@0.141.0/http/file_server.ts";

import { TRequest } from '../../@types/server.ts';

import RouteException from '../../foundation/exceptions/router/route.exception.ts';
import RouterException from '../../foundation/exceptions/router/router.exception.ts';

import StaticFolderPage from "../../foundation/templates/static/folder.ts";

type TContent = {
    name: string;
    type: "file" | "directory";
    size: number;
    lastModified?: number;
    symlink: boolean;
}

type TInformation = {
    path: string;
    content: TContent[];
}

export class RouterStaticsService extends Service {
    protected __pathStatics: string = "";
    protected __hostname: string = "";
    protected __request: TRequest;

    public setPathStatics(path: string) {
        this.__pathStatics = path;
    }

    public setRequest(request: TRequest) {
        this.__request = request;
    }

    public setHostname(hostname: string) {
        this.__hostname = hostname;
    }

    public async getFolder(pathname: string) {
        if (!this.__pathStatics) throw new RouterException("Static path not set", "router/file");

        let dirPath: string;

        const information: TInformation = {
            path: "",
            content: [],
        }

        try {
            dirPath = `${this.__pathStatics}${pathname}`;

            information.path = pathname;

            for await (const content of Deno.readDir(dirPath)) {
                const fileStat = await Deno.stat(`${dirPath}/${content.name}`);

                information.content.push({
                    name: content.name,
                    type: content.isFile ? "file" : "directory",
                    size: fileStat.size,
                    lastModified: fileStat.mtime ? fileStat.mtime.getTime() : undefined,
                    symlink: content.isSymlink
                });
            }
        } catch {
            throw new RouteException(`This url '${pathname}' no exist to router.`, "http/route/404");
        }

        const hasViewFolder = await template().exists("@templates/static/folder");

        let view: any;

        if (hasViewFolder) {
            view = await template().view("@templates/static/folder", information);
        } else {
            const html = StaticFolderPage;

            view = await template().render(html, information);
        }

        const handle = () => view instanceof Response ? view : new Response(view, { headers: { "Content-Type": "text/html" }, status: 200 });

        return new Route(pathname, "GET", handle);
    }

    public async getFile(pathname: string)  {
        if (!this.__pathStatics) throw new RouterException("Static path not set", "router/file");

        const filePath = `${this.__pathStatics}${pathname}`;

        let resp: Response;

        try {
            resp = await serveFile(this.__request, filePath);
        } catch (error) {
            throw new RouteException(`This url '${pathname}' no exist to router.`, "http/route/404", error);
        }

        const handle = () => resp;

        return new Route(pathname, "GET", handle);
    }
}
