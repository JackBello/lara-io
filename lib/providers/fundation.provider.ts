import { Provider } from './provider.ts';

import { IConnectionInfo } from '../@types/interfaces/server.interface.ts';

import { TemplateService } from '../services/template/template.service.ts';

import { RequestService } from '../services/request/request.service.ts';

import { RouterStaticsService } from '../services/router/router-statics.service.ts'
import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { ServerHandleService } from '../services/server/server-handle.service.ts';

import { ServerConfig } from '../configs/server.config.ts';
import { ServerService } from '../services/server/server.service.ts';

export class FundationProvider extends Provider{
    register() {
        this.app.registerService("template", TemplateService, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });

        this.app.registerService("request", RequestService, {
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
        const $server = this.app.use("server");
        const $serverHandle = this.app.use('server/handle');

        const $request = this.app.use('request');

        const $router = this.app.use('router');
        const $routerHistory = this.app.use('router/history');
        const $routerStatics = this.app.use('router/statics');

        const { statics, app } = this.app.config("paths");

        $routerStatics.setStatics(statics);

        $router.setPathController(app);

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