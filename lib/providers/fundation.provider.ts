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
    }

    async boot() {
        const $httpRequest = this.app.use('http/request');

        const $routeContext = this.app.use("route/context");

        const $server = this.app.service("server");
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

        $router.useMiddleware($routerMiddleware);

        $routeContext.inject("request", $httpRequest);
        $routeContext.inject("history", $routerHistory);
        $routeContext.inject("view", $templateEngine.view);
        $routeContext.inject("config", this.app.config);
        $routeContext.inject("service", this.app.service);

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