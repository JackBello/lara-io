// deno-lint-ignore-file no-explicit-any
import { Service } from '../services.ts';

import { getBasePath } from '../../utils/index.ts';

import { history, request, app } from '../../helpers/index.ts';

import { History, Request, App } from '../../modules/fecades.ts'

export class TemplateEngineService extends Service {
    protected __resources?: string;
    protected __engine = "atom";
    protected __engines: Map<string, any> = new Map();

    private context: any = {
        variables: {},
    };
    
    private fecaces: any = {
        'App': App,
        'History': History,
        'Request': Request,
    };
    private helpers: any = {
        'app': app,
        'history': history,
        'request': request,
    };

    public render(html: string, data: any) {
        this.context = data;
        
        const engine = this.__engines.get(this.__engine);

        const compiled = engine.compile(html)(this.context, this.fecaces, this.helpers);

        this.context = {}

        return compiled;
    }
    
    public async view(view: string, data: any = {}) {
        let html = "";

        if (view.lastIndexOf(".ts") !== -1) {
            const path = getBasePath(`${this.__resources}/views/${view.replace(".ts","")}.${this.__engine}.ts`);

            const module = await import(path);

            html = module.default();
        } else {
            const file = new TextDecoder().decode(Deno.readFileSync(`${this.__resources}/views/${view}.${this.__engine}`));

            html = file;
        }

        const result = this.render(html, data);

        return new Response(result, { headers: { "Content-Type": "text/html" }, status: 200 });
    }

    public registerEngine(name: string, engine: any) {
        this.__engines.set(name, engine);
    }

    public setEngine(engine: string) {
        this.__engine = engine;
    }

    public lookResources(resources: string) {
        this.__resources = resources;
    }

}