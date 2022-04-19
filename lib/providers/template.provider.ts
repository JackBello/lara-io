import { Provider } from './provider.ts';

import { TemplateEngineService } from '../services/template/template-engine.service.ts';

import { EngineAtom } from '../services/template/engine-atom.service.ts';
export class TemplateProvider extends Provider{
    register() {
        this.app.registerService("template/engine", TemplateEngineService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.registerService("template/engine/atom", EngineAtom, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });
    }

    boot() {
        const $templateEngine = this.app.service("template/engine");
        const $atomEngine = this.app.service("template/engine/atom");

        const { resources } = this.app.config("paths");

        $templateEngine.lookResources(resources);

        $templateEngine.setEngine("atom");

        $templateEngine.registerEngine("atom", $atomEngine);
    }
}