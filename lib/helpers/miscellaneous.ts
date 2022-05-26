import { Application } from '../fundation/application.ts';

import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { THttpRequest } from '../modules/types.ts';

import { StorageService } from '../services/storage/storage.service.ts';

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

export function template() {
    return service("template/engine");
}

export async function view(view: string, data = {}) {
    return await service("template/engine").view(view, data);
}

export function router(): RouterService {
    return service("router");
}

export function history(): RouterHistoryService {
    return app().make('@service/router/history', {});
}

export function storage(): StorageService {
    return app().make('@service/storage', {});
}