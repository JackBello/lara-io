// deno-lint-ignore-file no-explicit-any
export default class RouteException extends Error {
    public date: Date;
    public type: string;
    public extra: any;

    constructor(message: string, type: string, extra?: any) {
        super(message);
        this.type = type;
        this.extra = extra;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, RouteException)
        }

        this.name = this.constructor.name;
        this.date = new Date();
    }
}
