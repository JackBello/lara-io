import Provider from '../../../lib/@types/abstracts/provider.abstract.ts';

import Router from '../../../lib/router/index.router.ts';

import App from '../../../lib/fecades/app.facede.ts';

import Serve from '../../../lib/fecades/server.facade.ts';

export default class ServerProvider extends Provider {
    protected async boot() {
        const router = App.getService<Router>("router");

        Serve.loadRequest((req) => {
            router.handlerPetition(req);

            return router.init();
        });

        await Serve.initServer();
    }
}