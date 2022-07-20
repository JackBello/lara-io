// deno-lint-ignore-file no-explicit-any
import { Service } from '../services.ts';

import { history, request, config, service, app } from '../../helpers/miscellaneous.ts';

import { History, HttpRequest, App } from '../../modules/fecades.ts';

import { appPath, configPath, databasePath, ecosystemPath, publicPath, resourcePath, routerPath, storagePath } from '../../helpers/paths.ts';

import { css, script } from '../../helpers/urls.ts';

import defaultContent from './default-content.ts';

import { HandlerException } from '../../foundation/exceptions/handler-exceptions.ts';
export class TemplateEngineService extends Service {
    protected __handler: HandlerException = this.app.make("@handler", {});
    protected __pathViews?: string;
    protected __engine = "atom";
    protected __engines: Map<string, any> = new Map();

    private context: any = {};

    private fecaces: any = {
        'App': App,
        'History': History,
        'Request': HttpRequest,
    };
    private helpers: any = {
        'app': app,
        'service': service,
        'config': config,
        'history': history,
        'request': request,
        'appPath': appPath,
        'configPath': configPath,
        'databasePath': databasePath,
        'ecosystemPath': ecosystemPath,
        'publicPath': publicPath,
        'resourcePath': resourcePath,
        'routerPath': routerPath,
        'storagePath': storagePath,
        'css': css,
        'script': script,
    };

    private global: any = {};

    private shared: any;

    get engine(): any {
        return this.__engines.get(this.__engine);
    }

    public async render(html: string, data: any): Promise<any> {
        try {
            this.context = data;

            const compiled = await this.engine.compile(html)(this.context, this.fecaces, this.helpers, this.global, this.shared);

            this.context = {}

            return compiled;
        } catch (exception) {
            console.log(exception);

            this.__handler.report(exception);
        }
    }

    public async view(view: string, data: any = {}): Promise<any> {
        try {
            const html = new TextDecoder().decode(Deno.readFileSync(`${this.__pathViews}${view}.${this.__engine}`));

            const result = await this.render(html, data);

            return new Response(result, { headers: { "Content-Type": "text/html" }, status: 200 });
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public getView(view: string) {
        try {
            return new TextDecoder().decode(Deno.readFileSync(`${this.__pathViews}${view}.${this.__engine}`));
        } catch(exception) {
            this.__handler.report(exception);
        }
    }

    public exists(view: string): boolean {
        try {
            Deno.statSync(`${this.__pathViews}${view}.${this.__engine}`);
            return true;
        } catch {
            return false;
        }
    }

    public async create(name: string, content?: string, data?: any): Promise<any> {
        try {
            if (content) {
                Deno.writeTextFileSync(`${this.__pathViews}${name}.${this.__engine}`, content);
            } else {
                Deno.writeTextFileSync(`${this.__pathViews}${name}.${this.__engine}`, defaultContent);
            }

            if (data) {
                return await this.view(name, data);
            }
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public share(values: any): void {
        try {
            this.shared = this.engine.share(values);
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public preloadData(data: any): void {
        try {
            for (const key in data) {
                this.context[key] = data[key];
            }
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public registerHelper(name: string, helper: any): void {
        try {
            this.helpers[name] = helper;
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public registerFecace(name: string, fecace: any): void {
        try {
            this.fecaces[name] = fecace;
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public registerGlobal(name: string, value: any): void {
        try {
            this.global[name] = value;
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public registerEngine(name: string, engine: any): void {
        try {
            this.__engines.set(name, engine);
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public setEngine(engine: string): void {
        try {
            this.__engine = engine;
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    public setPathViews(path: string): void {
        try {
            this.__pathViews = `${path}/views/`;
        } catch (exception) {
            this.__handler.report(exception);
        }
    }
}
