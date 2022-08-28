// deno-lint-ignore-file no-inferrable-types no-explicit-any
import { Service } from '../services.ts';

import { Async } from '../../dependencies.ts';

import { IConnectionInfo, ISettingServer } from '../../@types/server.ts';

import { ServerHandleService } from './server-handle.service.ts';

import { HandlerException } from '../../foundation/exceptions/handler-exceptions.ts';

const { delay } = Async;

export class ServerService extends Service {
    protected __handler: HandlerException = this.app.make("@handler", {});
    protected _closedConnection_ = false;
    protected _running_ = false;

    protected _listeners_: Set<Deno.Listener> = new Set();
    protected _httpConnections_: Set<Deno.HttpConn> = new Set();

    protected __errorServerClosed = "Server closed";
    protected __initialAcceptBackoffDelay: number = 5;
    protected __maxAcceptBackoffDelay: number = 1000;

    public get running(): boolean {
        return this._running_;
    }

    public async initServer(): Promise<void> {
        const {
            hostname,
            port
        }: ISettingServer = this.app.config("server");

        if(this._closedConnection_) {
            throw new Deno.errors.Http(this.__errorServerClosed);
        }

        const listener = Deno.listen({
            hostname: hostname,
            port: port,
            transport: "tcp"
        });

        this._running_ = true;

        return await this.serve(listener);
    }

    public async serve(listener: Deno.Listener): Promise<void> {
        if (this._closedConnection_) throw new Deno.errors.Http(this.__errorServerClosed);

        this.trackListener(listener);

        try {
            return await this.accept(listener);
        } finally {
            this.untrackListener(listener);

            try {
                listener.close();
            } catch(exception) {
                this.__handler.report(exception);
                // Listener has already been closed.
            }
        }
    }

    public serveResponse(content: any, headers: Headers) {
        try {
            return this.prepareResponse(content, headers);
        } catch (exception) {
            this.__handler.report(exception);
        }
    }

    protected prepareResponse(body: any, headers: Headers) {
        if (body instanceof Response) {
            headers.forEach((value, key) => {
                body.headers.set(key, value);
            });

            return body;
        }

        else if (typeof body === "string" || typeof body === "number" || typeof body === "boolean" || typeof body === "bigint") {
            headers.set("Content-Type", "text/plain");
            return new Response(`${body}`, { status: 200, headers });
        }

        else if (typeof body === "object" && typeof body !== "undefined" && body !== null) {
            headers.set("Content-Type", "application/json");
            return new Response(JSON.stringify(body), { status: 200, headers });
        }

        else throw new Error("empty response body");
    }

    protected async accept(listener: Deno.Listener): Promise<void> {
        let acceptBackoffDelay: number | undefined;

        while (!this._closedConnection_) {
            let connection: Deno.Conn;

            try {
                connection = await listener.accept();
            } catch (exception) {
                if (
                    exception instanceof Deno.errors.BadResource ||
                    exception instanceof Deno.errors.InvalidData ||
                    exception instanceof Deno.errors.UnexpectedEof ||
                    exception instanceof Deno.errors.ConnectionReset ||
                    exception instanceof Deno.errors.NotConnected
                ) {
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = this.__initialAcceptBackoffDelay;
                    } else {
                        acceptBackoffDelay *= 2;
                    }

                    if (acceptBackoffDelay >= this.__maxAcceptBackoffDelay) {
                        acceptBackoffDelay = this.__maxAcceptBackoffDelay;
                    }

                    await delay(acceptBackoffDelay);

                    continue;
                }

                this.__handler.report(exception)

                break;
            }

            acceptBackoffDelay = undefined;

            let httpConnection: Deno.HttpConn;

            try {
                httpConnection = Deno.serveHttp(connection);
            } catch(exception) {
                this.__handler.report(exception);
                continue;
            }

            this.trackHttpConnection(httpConnection);

            const connectionInfo: IConnectionInfo = {
                localAddr: connection.localAddr,
                remoteAddr: connection.remoteAddr,
            };

            this.http(httpConnection, connectionInfo);
        }
    }

    protected close(): void {
        if (this._closedConnection_) throw new Deno.errors.Http(this.__errorServerClosed)

        this._closedConnection_ = true;

        for (const listener of this._listeners_) {
            this.closeListener(listener);
        }

        this._listeners_.clear();

        for (const connecion of this._httpConnections_) {
            this.closeHttpConnection(connecion);
        }

        this._httpConnections_.clear();
    }


    protected async http(httpConnection: Deno.HttpConn, connectionInfo: IConnectionInfo) {
        while (!this._closedConnection_) {
            let requestEvent: Deno.RequestEvent | null;

            try {
                requestEvent = await httpConnection.nextRequest();
            } catch(exception) {
                this.__handler.report(exception);
                break;
            }

            if (requestEvent === null) break;

            this.respond(requestEvent, httpConnection, connectionInfo);
        }

        this.closeHttpConnection(httpConnection);
    }

    protected async respond(requestEvent: Deno.RequestEvent, httpConnection: Deno.HttpConn, connectionInfo: IConnectionInfo) {
        const handle: ServerHandleService = this.app.service("server/handle");

        let response: Response;
        let request: Request;

        try {
            request = requestEvent.request;
            response = await handle.getHandleRequest(request, connectionInfo);
        } catch (exception: any) {
            this.__handler.report(exception);

            request = requestEvent.request;
            response = await handle.getHandleRequest(request, connectionInfo);
        }

        try {
            await requestEvent.respondWith(response);
        } catch {
            return this.closeHttpConnection(httpConnection);
        }
    }

    protected closeListener(listener: Deno.Listener): void {
        this.untrackListener(listener);

        try {
            listener.close();
        } catch (exception) {
            console.error(exception);
            // Listener has already been closed.
        }
    }

    protected closeHttpConnection(httpConnection: Deno.HttpConn): void {
        this.untrackHttpConnection(httpConnection);

        try {
            httpConnection.close();
        } catch (exception) {
            console.error(exception);
            // Connection has already been closed
        }
    }

    protected trackHttpConnection(httpConnection: Deno.HttpConn): void {
        this._httpConnections_.add(httpConnection);
    }

    protected untrackHttpConnection(httpConnection: Deno.HttpConn): void {
        this._httpConnections_.delete(httpConnection);
    }

    protected trackListener(listener: Deno.Listener): void {
        this._listeners_.add(listener);
    }

    protected untrackListener(listener: Deno.Listener): void {
        this._listeners_.delete(listener);
    }

    get addrs(): Deno.Addr[] {
        return Array.from(this._listeners_).map((listener) => listener.addr);
    }
}
