import { Provider } from './provider.ts';

import { IConnectionInfo } from '../@types/interfaces/server.interface.ts';

import { ServerHandleService } from '../services/server/server-handle.service.ts';

import { ServerService } from '../services/server/server.service.ts';

export class ServerProvider extends Provider{
    register() {
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
        const $httpRequest = this.app.use('http/request');

        const $server = this.app.service("server");
        const $serverHandle = this.app.service('server/handle');

        const $router = this.app.service('router');
        const $routerHistory = this.app.service('router/history');
        const $routerStatics = this.app.service('router/statics');

        $router.useHistory($routerHistory);

        $router.useFileStatic($routerStatics);

        $serverHandle.applyHandleRequest(async (request: Request, connection: IConnectionInfo) => {
            $httpRequest.setRequest(request);
            $httpRequest.setConnection(connection);

            $routerHistory.setUrl(request);

            $router.setRequest(request);

            return await $router.lookPetitions();
        });

        await $server.initServer();
    }
}