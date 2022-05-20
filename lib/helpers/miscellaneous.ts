import { Container } from '../container/container.ts';

import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { THttpRequest } from '../@types/request.type.ts';

import { StorageService } from '../services/storage/storage.service.ts';

export function app() {
    return Container.instance;
}

export function config(name: string) {
    return app().make(`@config/${name}`, {});
}

export function view() {
    return app().make("@service/template/engine", {});
}

export function request(): THttpRequest {
    return app().make('@/http/request', {});
}

export function router(): RouterService {
    return app().make('@service/router', {});
}

export function history(): RouterHistoryService {
    return app().make('@service/router/history', {});
}

export function storage(): StorageService {
    return app().make('@service/storage', {});
}