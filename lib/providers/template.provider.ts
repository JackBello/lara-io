import { Provider } from './provider.ts';

import { TemplateService } from '../services/template/template.service.ts'

export class TemplateProvider extends Provider{
    register() {
        this.app.registerService("template", TemplateService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });
    }

    async boot() {

    }
}