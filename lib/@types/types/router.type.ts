export type TCallbackRoute = (request: Request) => string | Promise<Response> | Response;

export type TCallbackGroup = () => any;