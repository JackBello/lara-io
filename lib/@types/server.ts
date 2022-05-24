// deno-lint-ignore-file no-explicit-any

// interfaces

export interface ISettingServer {
    port: number;
    hostname: string;
}

export interface IConnectionInfo {
    readonly remoteAddr: Deno.Addr;
    readonly localAddr: Deno.Addr;
}

// types

export type TResponse = Response | Promise<Response> | any;
export type TRequest = Request | any;

export type THandleResponse = (body: BodyInit, status?: number) => TResponse;
export type THandleRequest = (request?: TRequest, ...args: Array<any>) => TResponse;
export type THandleError = (error: unknown, request?: TRequest) => TResponse;

export type TMethodHTTP = "GET" | "POST" | "DELETE" | "PUT" | "OPTIONS" | "PATCH";
export type TAllMethodHTTP = string | "GET" | "POST" | "DELETE" | "PUT" | "OPTIONS" | "PATCH" | "HEAD" | "CONNECT" | "TRACE";

export type TAllCodesHTTP = 100 | 101 | 102 | 103 | 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226 | 300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308 | 400 | 401 | 402 | 403 | 404 | 405 | 406 | 407 | 408 | 409 | 410 | 411 | 412 | 413 | 414 | 415 | 416 | 417 | 418 | 421 | 422 | 423 | 424 | 426 | 428 | 429 | 431 | 451 | 500 | 501 | 502 | 503 | 504 | 505 | 506 | 507 | 508 | 510 | 511;
