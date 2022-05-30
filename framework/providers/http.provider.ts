import { Provider } from './provider.ts';

import { HttpRequest } from '../fundation/http/request/http-request.ts';

export class HttpProvider extends Provider{
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
