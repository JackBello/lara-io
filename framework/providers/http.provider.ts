import { Provider } from './provider.ts';

import { HttpRequest } from '../foundation/http/http-request.ts';
import { HttpResponse } from '../foundation/http/http-response.ts';

export class HttpProvider extends Provider{
    register() {
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
    }

    boot() {

    }
}
