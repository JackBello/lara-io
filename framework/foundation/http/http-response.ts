// deno-lint-ignore-file no-explicit-any no-inferrable-types
import { serveFile } from "https://deno.land/std@0.141.0/http/file_server.ts";
import { readableStreamFromReader } from 'https://deno.land/std@0.141.0/streams/mod.ts';

import { StatusText } from './http-status.ts';
import { MimeTypeByExtension } from './http-mimetypes.ts';
import { HttpFile } from './http-file.ts';

import { template, history } from '../../helpers/miscellaneous.ts';

import { Path, Cookies, conversionXML, conversionYAML } from '../../dependencies.ts';

const { extname, basename } = Path;
const { setCookie } = Cookies;

export class HttpResponse {
    private __request?: Request;
    private __status: number = 200;
    private __headers: Headers = new Headers();
    private __body: any;

    public clearResponse() {
        this.__headers = new Headers();
        this.__status = 200;
        this.__body = "";
    }

    public getHeaders() {
        return this.__headers;
    }

    public setBody(body: any) {
        this.__body = body;
    }

    public setStatus(status: number) {
        this.__status = status;
    }

    public setRequest(request: Request) {
        this.__request = request;
    }

    public make(content: any = undefined, status: number = 200, headers: Record<string, string> = {}) {
        let statusText;

        if (content) {
            statusText = StatusText[status];

            for (const key in headers) this.__headers.set(key, headers[key]);

            return new Response(content, { status, headers: this.__headers, statusText })
        }

        statusText = StatusText[this.__status];

        return new Response(this.__body, { status: this.__status, headers: this.__headers, statusText })
    }

    public json(content: any, optionals: any = {}, status: number = 200, headers: Record<string, string> = {}) {
        const { replacer, space } = optionals;
        const statusText = StatusText[status];

        for (const key in headers) this.__headers.set(key, headers[key]);

        this.__headers.set("Content-Type", "application/json");

        return new Response(JSON.stringify(content, replacer, space), { status, headers: this.__headers, statusText });
    }

    public xml(content: any, status: number = 200, headers: Record<string, string> = {}) {
        const statusText = StatusText[status];

        for (const key in headers) this.__headers.set(key, headers[key]);

        this.__headers.set("Content-Type", "application/xml");

        return new Response(conversionXML.stringify(content), { status, headers: this.__headers, statusText });
    }

    public yaml(content: any, status: number = 200, headers: Record<string, string> = {}) {
        const statusText = StatusText[status];

        for (const key in headers) this.__headers.set(key, headers[key]);

        this.__headers.set("Content-Type", "text/yaml");

        return new Response(conversionYAML.stringifyYAML(content), { status, headers: this.__headers, statusText });
    }

    public async file(file: string | HttpFile) {
        if (!this.__request) throw new Error("Request not found");

        if (file instanceof HttpFile) {
            try {
                if (file.fullPath) return await serveFile(this.__request, file.fullPath);
            } catch {
                throw new Error(`This url '${file.fullPath}' no exist to router.`);
            }
        } else if (typeof file === "string") {
            try {
                return await serveFile(this.__request, file);
            } catch {
                throw new Error(`This url '${file}' no exist to router.`);
            }
        }
    }

    public async view(name: string, data: any = {}, status: number = 200, headers: Record<string, string> = {}) {
        const html = template().getView(name);
        const render = await template().render(html, data);
        const statusText = StatusText[status];

        for (const key in headers) this.__headers.set(key, headers[key]);

        this.__headers.set("Content-Type", "text/html");

        return new Response(render, { headers: this.__headers , status, statusText })
    }

    public download(file: string | HttpFile, name?: string, headers?: Record<string, string>) {
        let content, open;

        for (const key in headers) this.__headers.set(key, headers[key]);

        if (file instanceof HttpFile) {
            if (file.fullPath) {
                open = Deno.openSync(file.fullPath, { read: true });

                content = readableStreamFromReader(open);

                if (name) {
                    this.__headers.set("content-type", file.mimeType);
                    this.__headers.set("content-disposition", `attachment; filename=${name}`);
                } else {
                    this.__headers.set("content-type", file.mimeType);
                    this.__headers.set("content-disposition", `attachment; filename=${file.fileName}`);
                }
            }
        } else if (typeof file === "string") {
            open = Deno.openSync(file, { read: true });

            content = readableStreamFromReader(open);

            if (name) {
                this.__headers.set("content-type", MimeTypeByExtension[extname(file)]);
                this.__headers.set("content-disposition", `attachment; filename=${name}`);
            } else {
                this.__headers.set("content-type", MimeTypeByExtension[extname(file)]);
                this.__headers.set("content-disposition", `attachment; filename=${basename(file)}`);
            }
        }

        return new Response(content, {headers: this.__headers, status: 200});
    }

    public stream() {

    }

    public redirect(url: string, status: number = 302) {
        return history().redirect(url, status);
    }

    public cookie(name: string, value: string) {
        setCookie(this.__headers, {name, value})
        return this;
    }

    public header(name: string, value: string) {
        this.__headers.set(name, value)
        return this;
    }

    public headers(headers: Record<string, string>) {
        for (const key in headers) this.__headers.set(key, headers[key]);
        return this;
    }
}
