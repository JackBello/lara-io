// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

import Route from './route.ts';

import { template } from '../../helpers/miscellaneous.ts';

import folderAtom from '../../fundation/templates/folder.atom.ts'

import { MimeTypeByExtension } from '../../fundation/http/http-mimetypes.ts';

import { Path, Streams } from '../../dependencies.ts';

const { extname } = Path;
const { readableStreamFromReader } = Streams;

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

    public setPathStatics(path: string) {
        this.__pathStatics = path;
    }

    public async getFolder(pathname: string) {
        if (!this.__pathStatics) throw new Error("Static path not set");

        let dir: Iterable<Deno.DirEntry>, dirPath: string;

        const information: TInformation = {
            path: "",
            content: []
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

    public async getFile(pathname: string)  {
        if (!this.__pathStatics) throw new Error("Static path not set");

        let file: Deno.FsFile, filePath: string, extension: string, mimeType: string;

        try {
            filePath = `${this.__pathStatics}${pathname}`;
            extension = extname(filePath);

            if (extension) {
                file = await Deno.open(filePath, { read: true });
                mimeType = MimeTypeByExtension[extension];
            }
        } catch {
            throw new Error(`This url '${pathname}' no exist to router`);
        }

        const handle = () => new Response(readableStreamFromReader(file), { headers: { "content-type": mimeType }, status: 200 });

        return new Route(pathname, undefined, handle);
    }
}
