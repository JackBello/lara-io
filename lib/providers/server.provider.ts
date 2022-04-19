import { Provider } from './provider.ts';

import { IConnectionInfo } from '../@types/interfaces/server.interface.ts';

import { ServerConfig } from '../configs/server.config.ts';

import { ServerHandleService } from '../services/server/server-handle.service.ts';

import { ServerService } from '../services/server/server.service.ts';

export class ServerProvider extends Provider{
    register() {
        this.app.registerConfig('server', ServerConfig);

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
    }

    async boot() {
        const $server = this.app.service("server");
        const $serverHandle = this.app.service('server/handle');

        const $request = this.app.use('request');

        const $router = this.app.service('router');
        const $routerHistory = this.app.service('router/history');
        const $routerStatics = this.app.service('router/statics');

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