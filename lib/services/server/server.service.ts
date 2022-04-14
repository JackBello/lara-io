// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

import { Async } from '../../dep.ts';

import { IConnectionInfo, ISettingServer } from '../../@types/interfaces/server.interface.ts';

import { ServerHandleService } from './server-handle.service.ts';

const { delay } = Async;

export class ServerService extends Service {
    protected _closedConnection_ = false;

    protected _listeners_: Set<Deno.Listener> = new Set();
    protected _httpConnections_: Set<Deno.HttpConn> = new Set();

    protected __errorServerClosed = "Server closed";
    protected __initialAcceptBackoffDelay: number = 5;
    protected __maxAcceptBackoffDelay: number = 1000;

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
            } catch {
                // Listener has already been closed.
            }
        }
    }

    protected async accept(listener: Deno.Listener): Promise<void> {
        let acceptBackoffDelay: number | undefined;

        while (!this._closedConnection_) {
            let connection: Deno.Conn;

            try {
                connection = await listener.accept();
            } catch (error) {
                if (
                    error instanceof Deno.errors.BadResource ||
                    error instanceof Deno.errors.InvalidData ||
                    error instanceof Deno.errors.UnexpectedEof ||
                    error instanceof Deno.errors.ConnectionReset ||
                    error instanceof Deno.errors.NotConnected
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

                throw error;
            }

            acceptBackoffDelay = undefined;

            let httpConnection: Deno.HttpConn;

            try {
                httpConnection = Deno.serveHttp(connection);
            } catch {
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
            } catch {
                break;
            }

            if (requestEvent === null) break;

            this.respond(requestEvent, httpConnection, connectionInfo);
        }

        this.closeHttpConnection(httpConnection);
    }

    protected async respond(requestEvent: Deno.RequestEvent, httpConnection: Deno.HttpConn, connectionInfo: IConnectionInfo) {
        const handle: ServerHandleService = this.app.use("server/handle");

        let response: Response;
        let request: Request;

        try {
            request = requestEvent.request;
            response = await handle.getHandleRequest(request, connectionInfo);
        } catch (error: unknown) {
            request = requestEvent.request;
            response = await handle.getHandleError(error, request);
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
        } catch {
            // Listener has already been closed.
        }
    }

    protected closeHttpConnection(httpConnection: Deno.HttpConn): void {
        this.untrackHttpConnection(httpConnection);

        try {
            httpConnection.close();
        } catch {
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