export default class RouteException extends Error {
    constructor(message: string) {
        super(message);

        Error.captureStackTrace(this, RouteException);

        this.name = this.constructor.name;
    }
}