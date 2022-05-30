import { Provider } from './provider.ts';

import { RouterMiddlewareService } from '../services/router/router-middleware.service.ts';
import { RouterStaticsService } from '../services/router/router-statics.service.ts'
import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

export class RouterProvider extends Provider{
    register() {
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
    }

    boot() {
        const $templateEngine = this.app.service('template/engine');

        const $router = this.app.service('router');
        const $routerMiddleware = this.app.service('router/middleware');
        const $routerHistory = this.app.service('router/history');
        const $routerStatics = this.app.service('router/statics');

        const { statics } = this.app.config("paths");

        const { http } = this.app.config("paths/app");

        const { hostname } = this.app.config("server");

        $routerStatics.setPathStatics(statics);

        $router.sethostname(hostname);

        $router.setPathController(http);

        $router.setPathMiddleware(http);

        $router.useTemplate($templateEngine);

        $router.useMiddleware($routerMiddleware);

        $router.useHistory($routerHistory);

        $router.useFileStatic($routerStatics);
    }
}
