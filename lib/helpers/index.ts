import { Container } from '../container/container.ts';

import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';
import { ServerService } from '../services/server/server.service.ts';

import { TRequestService } from '../@types/request.type.ts';

export function app() {
    return Container.instance;
}

export function view() {
    return app().make("@service/template/engine", {});
}

export function request(): TRequestService {
    return app().make('@/request', {});
}

export function router(): RouterService {
    return app().make('@service/router', {});
}

export function server(): ServerService {
    return app().make('@service/server', {});
}

export function history(): RouterHistoryService {
    return app().make('@service/router/history', {});
}