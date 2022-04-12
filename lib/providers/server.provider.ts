import { Provider } from './provider.ts';

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
        const server = this.app.use("server");
        const serverHandle = this.app.use('server/handle');
        const router = this.app.use('router');
        const routerHistory = this.app.use('router/history');
        const routerStatics = this.app.use('router/statics');

        const { statics } = this.app.config("paths");

        routerStatics.setStatics(statics);

        serverHandle.applyHandleRequest(async (request: Request) => {
            routerHistory.lookRequest(request);

            router.lookHistory(routerHistory);

            router.lookStatics(routerStatics);

            router.lookRequest(request);

            return await router.lookPetitions();
        });

        await server.initServer();
    }
}