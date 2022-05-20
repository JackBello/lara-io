import { Provider } from './provider.ts';

import { HttpRequest } from '../fundation/http/request/request.ts';

export class RouterProvider extends Provider{
    register() {
        this.app.register("http/request", HttpRequest, {
            isSingleton: true,
            isCallback: true,
            configService: {}
        });
    }

    boot() {

    }
}