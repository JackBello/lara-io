// deno-lint-ignore-file no-explicit-any
import { Service } from '../services.ts';

import { history, request, config, service, app } from '../../helpers/miscellaneous.ts';

import { History, HttpRequest, App } from '../../modules/fecades.ts';

import { appPath, configPath, databasePath, ecosystemPath, publicPath, resourcePath, routerPath } from '../../helpers/paths.ts';

import defaultContent from './default-content.ts';

export class TemplateEngineService extends Service {
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
    };

    private global: any = {};

    private shared: any;

    get engine(): any {
        return this.__engines.get(this.__engine);
    }

    public async render(html: string, data: any): Promise<any> {
        this.context = data;

        const compiled = await this.engine.compile(html)(this.context, this.fecaces, this.helpers, this.global, this.shared);

        this.context = {}

        return compiled;
    }

    public async view(view: string, data: any = {}): Promise<any> {
        const html = new TextDecoder().decode(Deno.readFileSync(`${this.__pathViews}${view}.${this.__engine}`));

        const result = await this.render(html, data);

        return new Response(result, { headers: { "Content-Type": "text/html" }, status: 200 });
    }

    public exists(view: string): boolean {
        return Deno.statSync(`${this.__pathViews}${view}.${this.__engine}`).isFile;
    }

    public async create(name: string, content?: string, data?: any): Promise<any> {
        if (content) {
            Deno.writeTextFileSync(`${this.__pathViews}${name}.${this.__engine}`, content);
        } else {
            Deno.writeTextFileSync(`${this.__pathViews}${name}.${this.__engine}`, defaultContent);
        }

        if (data) {
            return await this.view(name, data);
        }
    }

    public share(values: any): void {
        this.shared = this.engine.share(values);
    }

    public preloadData(data: any): void {
        for (const key in data) {
            this.context[key] = data[key];
        }
    }

    public registerHelper(name: string, helper: any): void {
        this.helpers[name] = helper;
    }

    public registerFecace(name: string, fecace: any): void {
        this.fecaces[name] = fecace;
    }

    public registerGlobal(name: string, value: any): void {
        this.global[name] = value;
    }

    public registerEngine(name: string, engine: any): void {
        this.__engines.set(name, engine);
    }

    public setEngine(engine: string): void {
        this.__engine = engine;
    }

    public setPathViews(path: string): void {
        this.__pathViews = `${path}/views/`;
    }
}
