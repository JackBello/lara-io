import { Provider } from './provider.ts';

import { IConnectionInfo } from '../@types/server.ts';

import { RouteContext } from '../foundation/router/route-context.ts';

import { TemplateEngineService } from '../services/template/template-engine.service.ts';
import { EngineAtom } from '../services/template/atom.engine.ts';

import { HttpProxy } from '../foundation/http/http-proxy.ts';
import { HttpRequest } from '../foundation/http/http-request.ts';
import { HttpResponse } from '../foundation/http/http-response.ts';

import { RouterStaticsService } from '../services/router/router-statics.service.ts'
import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { ServerHandleService } from '../services/server/server-handle.service.ts';

import { ServerService } from '../services/server/server.service.ts';

import { view, service, config, request, response, storage, history } from '../helpers/miscellaneous.ts'

import { StorageService } from '../services/storage/storage.service.ts';

export class FoundationProvider extends Provider{
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

        this.app.register("http/proxy", HttpProxy, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.register("http/request", HttpRequest, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.register("http/response", HttpResponse, {
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
        const $handler = this.app.make("@handler", {});
        const $kernel = this.app.make("@kernel", {});

        const $httpProxy = this.app.use('http/proxy');
        const $httpRequest = this.app.use('http/request');
        const $httpResponse = this.app.use('http/response');

        const $routeContext = this.app.use("route/context");

        const $server = this.app.service("server");
        const $serverHandle = this.app.service('server/handle');

        const $router = this.app.service('router');
        const $routerHistory = this.app.service('router/history');
        const $routerStatics = this.app.service('router/statics');

        const $templateEngine = this.app.service('template/engine');
        const $engineAtom = this.app.use("engine/atom");

        const { isDebug } = this.app.config("app");

        const { statics, resources } = this.app.config("paths");

        const { http } = this.app.config("paths/app");

        const { hostname } = this.app.config("server");

        const $storage = this.app.service('storage');

        $handler.setDebug(isDebug);

        $templateEngine.setPathViews(resources);

        $templateEngine.setEngine("atom");

        $templateEngine.registerEngine("atom", $engineAtom);

        $routerStatics.setPathStatics(statics);

        $routerStatics.setHostname(hostname);

        $router.sethostname(hostname);

        $router.setPathController(http);

        $router.useProxy($httpProxy);

        $router.useTemplate($templateEngine);

        $router.useHistory($routerHistory);

        $router.useFileStatic($routerStatics);

        $routeContext.inject("request", request);
        $routeContext.inject("response", response);
        $routeContext.inject("history", history);
        $routeContext.inject("storage", storage);
        $routeContext.inject("view", view);
        $routeContext.inject("config", config);
        $routeContext.inject("service", service);
        $routeContext.inject("proxy", $httpProxy.request);

        $storage.initStorage();

        $serverHandle.applyHandleRequest(async (request: Request, connection: IConnectionInfo) => {
            $kernel.mergeMiddlewares();

            $httpResponse.clearResponse();
            $httpResponse.setRequest(request);

            $httpRequest.setRequest(request);
            $httpRequest.setConnection(connection);

            $routerStatics.setRequest(request);
            $routerHistory.setUrl(request.url);
            $router.setRequest(request);

            if (!$handler.existsReport()) await $router.lookPetitions();

            let actionResponse, serveResponse;

            $kernel.setContext($routeContext.getContext());

            if ($kernel.existsMiddlewares()) {
                await $kernel.run();

                actionResponse = $kernel.excuting ? $kernel.result : $router.result;
            } else {
                actionResponse = $router.result;
            }

            if (!$handler.existsReport()) serveResponse = $server.serveResponse(actionResponse, $httpResponse.getHeaders());

            if ($handler.existsReport()) {
                const exception = $handler.getReport();

                $handler.console(exception);

                if (exception.type) {
                    if (exception.type.indexOf("http") !== -1) $handler.clearReports();
                }

                return await $handler.render(exception);
            }

            $kernel.clearMiddlewares();

            return serveResponse;
        });
    }
}
