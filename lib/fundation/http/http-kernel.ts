// deno-lint-ignore-file no-explicit-any
import { Application } from '../application.ts';
import { RouterService } from '../../services/router/router.service.ts';

export class HttpKernel {
    protected __app?: Application;
    protected __router?: RouterService;

    protected bootstrappers: any[] = [];
    protected middleware: any[] = [];
    protected middlewareGroups: any[] = [];
    protected routeMiddleware: any[] = [];
    protected middlewarePriority: any[] = [];

    set router(router: RouterService) {
        this.__router = router;
    }

    get router(): RouterService {
        if (!this.__router) throw new Error('Router is not set.');

        return this.__router;
    }

    set application(app: Application) {
        this.__app = app;
    }

    get application(): Application {
        if (!this.__app) throw new Error('Application is not set.');

        return this.__app;
    }
}