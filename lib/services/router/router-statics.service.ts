// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

import Route from './route.ts';

import { MimeTypeByExtension } from '../../fundation/http/http-mimetypes.ts';

import { Path, Streams } from '../../dep.ts';

const { extname } = Path;
const { readableStreamFromReader } = Streams;

export class RouterStaticsService extends Service {
    protected __pathStatics: string = "";

    public setPathStatics(path: string) {
        this.__pathStatics = path;
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