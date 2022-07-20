// deno-lint-ignore-file no-explicit-any
import { Application } from '../foundation/application.ts';

import { RouterHistoryService } from '../services/router/router-history.service.ts';
import { RouterService } from '../services/router/router.service.ts';

import { THttpRequest, TTemplate, THttpResponse } from '../modules/types.ts';

import { StorageService } from '../services/storage/storage.service.ts';

import { HttpKernel } from '../foundation/http/http-kernel.ts';

export function app() {
    return Application.instance;
}

export function handler() {
    return app().make("@handler", {});
}

export function kernel(): HttpKernel {
    return app().make("@kernel", {});
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

export async function proxy(url: string, options: any) {
    return await use("http/proxy").request(url, options);
}

export function response(content?: any, status?: number, headers?: Record<string, string>): Omit<THttpResponse, "setBody" | "setStatus" | "make">{
    const $httpResponse = use("http/response");

    if (content) return $httpResponse.make(content, status, headers);
    else return $httpResponse;
}

export function template(): TTemplate {
    return service("template/engine");
}

export async function view(view: string, data = {}) {
    return await template().view(view, data);
}

export function router(): RouterService {
    return service("router");
}

export function history(): RouterHistoryService {
    return service("router/history");
}

export function storage(): StorageService {
    return service('storage');
}
