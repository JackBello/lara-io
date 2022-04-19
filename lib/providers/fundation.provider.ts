import { Provider } from './provider.ts';

import { IConnectionInfo } from '../@types/interfaces/server.interface.ts';

import { TemplateEngineService } from '../services/template/template-engine.service.ts';
import { EngineAtom } from '../services/template/engine-atom.service.ts';

import { RequestRoute } from '../fundation/router/request.ts';

import { RouterStaticsService } from '../services/router/router-statics.service.ts'
import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { ServerHandleService } from '../services/server/server-handle.service.ts';

import { ServerConfig } from '../configs/server.config.ts';
import { ServerService } from '../services/server/server.service.ts';

export class FundationProvider extends Provider{
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

        this.app.register("request", RequestRoute, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.registerService("router/statics", RouterStaticsService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.registerService("router/history", RouterHistoryService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.registerService("router", RouterService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.registerService('server/handle', ServerHandleService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.registerConfig('server', ServerConfig);
        this.app.registerService('server', ServerService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });
    }

    async boot() {
        const $server = this.app.service("server");
        const $serverHandle = this.app.service('server/handle');

        const $request = this.app.use('request');

        const $router = this.app.service('router');
        const $routerHistory = this.app.service('router/history');
        const $routerStatics = this.app.service('router/statics');

        const $templateEngine = this.app.service('template/engine');
        const $atomEngine = this.app.service("template/engine/atom");

        const { statics, app, resources } = this.app.config("paths");

        $templateEngine.lookResources(resources);

        $templateEngine.setEngine("atom");

        $templateEngine.registerEngine("atom", $atomEngine);

        $routerStatics.setStatics(statics);

        $router.setPathController(app);

        $router.lookTemplate($templateEngine);

        $serverHandle.applyHandleRequest(async (request: Request, connection: IConnectionInfo) => {            
            $request.lookRequest(request);
            $request.lookConnectionInfo(connection);

            $routerHistory.lookRequest(request);

            $router.lookHistory($routerHistory);

            $router.lookStatics($routerStatics);

            $router.lookRequest(request);

            return await $router.lookPetitions();
        });

        await $server.initServer();
    }
}