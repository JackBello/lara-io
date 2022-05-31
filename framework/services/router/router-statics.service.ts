// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

import Route from './route.ts';

import { template } from '../../helpers/miscellaneous.ts';

import folderAtom from '../../fundation/templates/folder.atom.ts';

import { serveFile } from "https://deno.land/std@0.141.0/http/file_server.ts";

import { TRequest } from '../../@types/server.ts';

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
        if (!this.__pathStatics) throw new Error("Static path not set");

        let dir: Iterable<Deno.DirEntry>, dirPath: string;

        const information: TInformation = {
            path: "",
            content: [],
        }

        try {
            dirPath = `${this.__pathStatics}${pathname}`;
            dir = Deno.readDirSync(dirPath);

            information.path = pathname;

            for (const content of dir) {
                const fileStat = Deno.statSync(`${dirPath}/${content.name}`);

                information.content.push({
                    name: content.name,
                    type: content.isFile ? "file" : "directory",
                    size: fileStat.size,
                    lastModified: fileStat.mtime ? fileStat.mtime.getTime() : undefined,
                    symlink: content.isSymlink
                });
            }
        } catch {
            throw new Error(`This url '${pathname}' no exist to router`);
        }

        const html = await template().render(folderAtom(), information);

        const handle = () => new Response(html, { headers: { "Content-Type": "text/html" }, status: 200 });

        return new Route(pathname, undefined, handle);
    }

    public getFile(pathname: string)  {
        if (!this.__pathStatics) throw new Error("Static path not set");

        const filePath = `${this.__pathStatics}${pathname}`;

        const handle = async () => await serveFile(this.__request, filePath);

        return new Route(pathname, undefined, handle);
    }
}
