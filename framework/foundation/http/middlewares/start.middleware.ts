// deno-lint-ignore-file no-explicit-any
export const startMiddleware = (context: any, next: any) => {
    const { response } = context;

    response().header("start", "welcome to lara io");

    next();
}
