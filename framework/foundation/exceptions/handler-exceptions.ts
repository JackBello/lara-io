// deno-lint-ignore-file no-explicit-any no-inferrable-types
import { Path, IO, PATH_FRAMEWORK } from '../../dependencies.ts';

import RouteHandler from './router/route.handler.ts';
import { template } from '../../helpers/miscellaneous.ts';

import { readerFromStreamReader } from "https://deno.land/std@0.151.0/streams/mod.ts";
import { validateUrl } from '../../helpers/utils.ts';

const { basename, dirname } = Path;
const { readLines } = IO;

export class HandlerException {
    protected __debug: boolean = false;
    protected __reports: any = [];

    public async render(exception: any) {
        if (this.validateException(exception)) {
            return await this.prepareException(exception);
        }

        return new Response(JSON.stringify({exception}), { headers: { "Content-Type": "application/json" } });
    }

    public console(exception: any) {
        if (!this.__debug) {
            const { name, message, stack } = exception;

            // const stacks: any[] = this.prepareStack(stack);

            console.error(`[${name}] ${message}`);
            console.log(stack);
        }
    }

    public report(exception: any) {
        this.__reports.push(exception);
    }

    public clearReports() {
        this.__reports = [];
    }

    public setDebug(debug: boolean) {
        this.__debug = debug;
    }

    public getReport() {
        return this.__reports[0];
    }

    public existsReport() {
        return this.__reports.length > 0;
    }

    public register() {

    }

    protected async prepareException(exception: any) {
        const { name, message, stack, type, extra } = exception;

        const stacks: any[] = this.prepareStack(stack)
        const types: string[] = type ? type.split("/") : [];
        const codes: any[] = await this.prepareCode(stacks);

        if (types.includes("route") && types.includes("http")) {
            const status = parseInt(types[2]);

            return await RouteHandler(message, status);
        }

        if (this.__debug) {
            console.log(PATH_FRAMEWORK);

            const html = await Deno.readTextFile(`${PATH_FRAMEWORK}/foundation/templates/debug/index.atom`);

            const view = await template().render(html, {
                name,
                message,
                stacks,
                types,
                codes,
                extra
            });

            return new Response(view, { headers: { "Content-Type": "text/html" } });
        }

        // return new Response(JSON.stringify({
        //     name,
        //     message,
        //     stacks,
        //     types,
        //     codes,
        //     extra
        // }), { headers: { "Content-Type": "application/json" } });
    }

    protected async openFile(path: string) {
        if (validateUrl(path)) {
            const request = await fetch(path);
            const streamReader = readerFromStreamReader(request.body!.getReader());

            return streamReader;
        } else {
            return await Deno.open(path);
        }
    }

    protected async prepareCode(stacks: any[]) {
        const codes: any[] = [];

        for (const stack of stacks) {
            const lineCode = [];
            const lineError = Number(stack.code.error[0]);
            const indexPrev = lineError - 60;
            const indexNext = lineError + 60;

            const fileReader = await this.openFile(stack.info.path.system);

            const lines = readLines(fileReader);

            let index = 1;
            for await (const line of lines) {
                if (index >= indexPrev && index <= indexNext) {
                    lineCode.push({
                        code: line,
                        line: index
                    });
                }
                index++;
            }

            codes.push({
                path: stack.info.path.system,
                code: lineCode
            });
        }

        return codes;
    }

    protected prapereStackEval(stackEval: string, stacks: any[]) {
        const stacksEval: any[] = stackEval.split("\n");

        const format = stacksEval.filter((stack:string) => stack.indexOf("eval at compile") !== -1).map((stack:string) => {

        });

        return []
    }

    protected prepareStack(stack: string) {
        const stacks: any[] = stack.split("\n");

        stacks.shift();
        stacks.reverse();

        const format = stacks.map((stack:string) => {
            let controller, action;

            if (stack.indexOf("eval at compile") !== -1) {
                return undefined
            }

            const parts: string[] = stack.replace("    at ","").replace("(","").replace(")","").split(" ");

            if (parts[0].startsWith("file:///")) {
                controller = undefined;
                action = undefined;
            } else if (parts[0] === "async") {
                const [c, a] = parts[1].split(".");
                controller = c;
                action = a;
            } else {
                const [c, a] = parts[0].split(".");
                controller = c;
                action = a;
            }

            const sync = parts[0] === "async" ? true : false;
            const file = parts[parts.length - 1].startsWith("file:///") || parts[parts.length - 1].startsWith("https://") ? parts[parts.length - 1] : undefined;
            const indexNumberLine = file?.search(/:[0-9]+:[0-9]+/g);

            const errorLineAndColumnCode = file?.slice(indexNumberLine)?.slice(1)?.split(":");
            const file_import = file?.slice(0, indexNumberLine);
            const file_system = file?.slice(0, indexNumberLine)?.replace("file:///","");

            return {
                info: {
                    dir: file_system ? dirname(file_system) : undefined,
                    name: file_system ? basename(file_system) : undefined,
                    path: {
                        import: file_import,
                        system: file_system
                    }
                },
                code: {
                    error: errorLineAndColumnCode,
                    execute: {
                        isAsync: sync,
                        controller,
                        action
                    }
                }
            }
        })

        return format.filter(stack => stack !== undefined);
    }

    protected validateException(exception: any) {
        return exception instanceof Error;
    }
}
