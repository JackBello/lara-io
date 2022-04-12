// deno-lint-ignore-file no-explicit-any
export type TResponse = Response | Promise<Response> | any;
export type TRequest = Request | any;

export type THandleResponse = (body: BodyInit, status?: number) => TResponse;
export type THandleRequest = (request?: TRequest, ...args: Array<any>) => TResponse;
export type THandleError = (error: unknown, request?: TRequest) => TResponse;

export type TMethodHTTP = "GET" | "POST" | "DELETE" | "PUT" | "OPTIONS" | "PATCH";
export type TAllMethodHTTP = string | "GET" | "POST" | "DELETE" | "PUT" | "OPTIONS" | "PATCH";