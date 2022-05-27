import { Application } from '../fundation/application.ts';

import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { THttpRequest, TTemplate } from '../modules/types.ts';

export function app() {
    return Application.instance;
}

export function use(name: string) {
    return app().use(name);
}

export function config(name: string) {
    return app().config(name);
}

export function service(name: string) {
    return app().service(name);
}

export function provider(name: string) {
    return app().provider(name);
}

export function request(): THttpRequest {
    return use("http/request")
}

export function template(): TTemplate {
    return service("template/engine");
}

export async function view(view: string, data = {}) {
    return await service("template/engine").view(view, data);
}

export function router(): RouterService {
    return service("router");
}

export function history(): RouterHistoryService {
    return service("router/history");
}