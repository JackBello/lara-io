// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

import { Path, Streams } from '../../dep.ts';

const { join, extname } = Path;
const { readableStreamFromReader } = Streams;

export class RouterStaticsService extends Service {
    protected _statics: string = "";
    protected _contentType: { [key:string]: string } = {
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".avif": "image/avif",
        ".bmp": "image/bmp",
        ".webp": "image/webp",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
        ".woff": "application/font-woff",
        ".woff2": "application/font-woff2",
        ".ttf": "application/font-ttf",
        ".eot": "application/vnd.ms-fontobject",
        ".otf": "application/font-otf",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".ogg": "video/ogg",
        ".mp3": "audio/mpeg",
        ".wav": "audio/x-wav",
        ".flac": "audio/flac",
        ".aac": "audio/aac",
        ".oga": "audio/ogg",
        ".pdf": "application/pdf",
        ".doc": "application/msword",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".xls": "application/vnd.ms-excel",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".ppt": "application/vnd.ms-powerpoint",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".txt": "text/plain",
        ".rtf": "application/rtf",
        ".xml": "application/xml",
        ".zip": "application/zip",
        ".rar": "application/x-rar-compressed",
        ".7z": "application/x-7z-compressed",
        ".exe": "application/x-msdownload",
        ".msi": "application/x-msdownload",
    }

    public setStatics(path: string) {
        this._statics = path;
    }

    public async getFile(pathname: string) {
        if (!this._statics) throw new Error("Static path not set");

        let file: Deno.FsFile, filePath: string, extension: string, mimeType: string;

        try {
            filePath = `${this._statics}${pathname}`;
            extension = extname(filePath);

            if (extension) {
                file = await Deno.open(filePath, { read: true });
                mimeType = this._contentType[extension];
            } else {
                filePath = join(this._statics, pathname, "index.html");
                extension = extname(filePath);

                file = await Deno.open(filePath, { read: true });
                mimeType = this._contentType[extension];
            }
        } catch {
            throw new Error(`This url '${pathname}' no exist to router`);
        }

        return {
            uri: pathname,
            pattern: pathname,
            action: () => new Response(readableStreamFromReader(file), { headers: { "content-type": mimeType }, status: 200 })
        }
    }
}