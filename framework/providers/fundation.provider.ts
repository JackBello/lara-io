import { Provider } from './provider.ts';

import { IConnectionInfo } from '../@types/server.ts';

import { RouteContext } from '../fundation/router/route-context.ts';

import { TemplateEngineService } from '../services/template/template-engine.service.ts';
import { EngineAtom } from '../services/template/atom.engine.ts';

import { HttpRequest } from '../fundation/http/request/http-request.ts';

import { RouterMiddlewareService } from '../services/router/router-middleware.service.ts';
import { RouterStaticsService } from '../services/router/router-statics.service.ts'
import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { ServerHandleService } from '../services/server/server-handle.service.ts';

import { ServerService } from '../services/server/server.service.ts';

import { view, service, config } from '../helpers/miscellaneous.ts'

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

        this.app.registerService("router/middleware", RouterMiddlewareService, {
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

        this.app.register("route/context", RouteContext, {
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

    boot() {
        const $httpRequest = this.app.use('http/request');

        const $routeContext = this.app.use("route/context");

        const $serverHandle = this.app.service('server/handle');

        const $router = this.app.service('router');
        const $routerMiddleware = this.app.service('router/middleware');
        const $routerHistory = this.app.service('router/history');
        const $routerStatics = this.app.service('router/statics');

        const $templateEngine = this.app.service('template/engine');
        const $engineAtom = this.app.use("engine/atom");

        const { statics, resources } = this.app.config("paths");

        const { http } = this.app.config("paths/app");

        const { hostname } = this.app.config("server");

        const $storage = this.app.service('storage');

        $templateEngine.setPathViews(resources);

        $templateEngine.setEngine("atom");

        $templateEngine.registerEngine("atom", $engineAtom);

        $routerStatics.setPathStatics(statics);

        $routerStatics.setHostname(hostname);

        $router.sethostname(hostname);

        $router.setPathController(http);

        $router.setPathMiddleware(http);

        $router.useTemplate($templateEngine);

        $router.useHistory($routerHistory);

        $router.useFileStatic($routerStatics);

        $router.useMiddleware($routerMiddleware);

        $routeContext.inject("request", $httpRequest);
        $routeContext.inject("history", $routerHistory);
        $routeContext.inject("view", view);
        $routeContext.inject("config", config);
        $routeContext.inject("service", service);

        $storage.initStorage();

        $serverHandle.applyHandleRequest(async (request: Request, connection: IConnectionInfo) => {
            $httpRequest.setRequest(request);
            $httpRequest.setConnection(connection);

            $routerStatics.setRequest(request);

            $routerHistory.setUrl(request.url);

            $router.setRequest(request);

            return await $router.lookPetitions();
        });
    }
}
