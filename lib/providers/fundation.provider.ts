import { Provider } from './provider.ts';

import { IConnectionInfo } from '../@types/interfaces/server.interface.ts';

import { TemplateEngineService } from '../services/template/template-engine.service.ts';
import { EngineAtom } from '../services/template/atom.engine.ts';

import { HttpRequest } from '../fundation/http/request/request.ts';

import { RouterStaticsService } from '../services/router/router-statics.service.ts'
import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { ServerHandleService } from '../services/server/server-handle.service.ts';

import { ServerService } from '../services/server/server.service.ts';

import { StorageService } from '../services/storage/storage.service.ts';

export class FundationProvider extends Provider{
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

        this.app.register("http/request", HttpRequest, {
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

        this.app.registerService('server', ServerService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });
        
        this.app.registerService('storage', StorageService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });
    }

    async boot() {
        const $httpRequest = this.app.use('http/request');

        const $server = this.app.service("server");
        const $serverHandle = this.app.service('server/handle');

        const $router = this.app.service('router');
        const $routerHistory = this.app.service('router/history');
        const $routerStatics = this.app.service('router/statics');

        const $templateEngine = this.app.service('template/engine');
        const $engineAtom = this.app.use("engine/atom");

        const { hostname } = this.app.config("server");

        const { statics, resources } = this.app.config("paths");

        const { http } = this.app.config("paths/app");

        const $storage = this.app.service('storage');

        $storage.initStorage();

        $templateEngine.setPathViews(resources);

        $templateEngine.setEngine("atom");

        $templateEngine.registerEngine("atom", $engineAtom);

        $routerStatics.setPathStatics(statics);

        $router.sethostname(hostname);

        $router.setPathController(http);

        $router.setPathMiddleware(http);

        $router.useTemplate($templateEngine);

        $router.useHistory($routerHistory);

        $router.useFileStatic($routerStatics);

        $serverHandle.applyHandleRequest(async (request: Request, connection: IConnectionInfo) => {            
            $httpRequest.setRequest(request);
            $httpRequest.setConnection(connection);

            $routerHistory.setUrl(request.url);

            $router.setRequest(request);

            return await $router.lookPetitions();
        });

        await $server.initServer();
    }
}