// deno-lint-ignore-file no-explicit-any
import { Service } from '../services.ts';

import { getBasePath } from '../../utils/index.ts';

import { history, request, config, app } from '../../helpers/miscellaneous.ts';

import { History, HttpRequest, App } from '../../modules/fecades.ts';

import { appPath, configPath, databasePath, ecosystemPath, publicPath, resourcePath, routerPath } from '../../helpers/paths.ts';

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

    public async render(html: string, data: any) {
        this.context = data;
        
        const engine = this.__engines.get(this.__engine);

        const compiled = await engine.compile(html)(this.context, this.fecaces, this.helpers);

        this.context = {}

        return compiled;
    }
    
    public async view(view: string, data: any = {}) {
        let html = "";

        if (view.lastIndexOf(".ts") !== -1) {
            const path = getBasePath(`${this.__pathViews}${view.replace(".ts","")}.${this.__engine}.ts`);

            const module = await import(path);

            html = module.default();
        } else {
            const file = new TextDecoder().decode(Deno.readFileSync(`${this.__pathViews}${view}.${this.__engine}`));

            html = file;
        }

        const result = await this.render(html, data);

        return new Response(result, { headers: { "Content-Type": "text/html" }, status: 200 });
    }

    public registerEngine(name: string, engine: any) {
        this.__engines.set(name, engine);
    }

    public setEngine(engine: string) {
        this.__engine = engine;
    }

    public setPathViews(path: string) {
        this.__pathViews = `${path}/views/`;
    }
}