import { Provider } from './provider.ts';

import { TemplateEngineService } from '../services/template/template-engine.service.ts';

import { EngineAtom } from '../services/template/engines/atom.engine.ts';
export class TemplateProvider extends Provider{
    register() {
        this.app.registerService("template/engine", TemplateEngineService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.register("engine/atom", EngineAtom, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });
    }

    boot() {
        const $templateEngine = this.app.service("template/engine");
        const $engineAtom = this.app.use("engine/atom");

        const { resources } = this.app.config("paths");

        $templateEngine.setPathViews(resources);

        $templateEngine.setEngine("atom");

        $templateEngine.registerEngine("atom", $engineAtom);
    }
}
