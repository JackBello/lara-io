import { Service } from '../services.ts';

import { Async } from '../../dep.ts';

import { IConnectionInfo, ISettingServer } from '../../@types/interfaces/server.interface.ts';

import { ServerHandleService } from './server-handle.service.ts';

const { delay } = Async;

const _DEFAULT_ = {
    ERROR_SERVER_CLOSED: "Server closed",
    HTTPS_PORT: 443,
    HTTP_PORT: 80,
    INITIAL_ACCEPT_BACKOFF_DELAY: 5,
    MAX_ACCEPT_BACKOFF_DELAY: 1000
};

export class ServerService extends Service {
    protected _closedConnection_ = false;

    protected _listeners_: Set<Deno.Listener> = new Set();
    protected _httpConnections_: Set<Deno.HttpConn> = new Set();

    public async initServer(): Promise<void> {
        const {
            hostname,
            port
        }: ISettingServer = this.app.config("server");

        if(this._closedConnection_) {
            throw new Deno.errors.Http(_DEFAULT_.ERROR_SERVER_CLOSED);
        }

        const listener = Deno.listen({
            hostname: hostname,
            port: port,
            transport: "tcp"
        });

        return await this.serve(listener);
    }

    protected async serve(listener: Deno.Listener): Promise<void> {
        if (this._closedConnection_) throw new Deno.errors.Http(_DEFAULT_.ERROR_SERVER_CLOSED)

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
                // Wait for a new connection.
                connection = await listener.accept();
            } catch (error) {
                if (
                    // The listener is closed.
                    error instanceof Deno.errors.BadResource ||
                    // TLS handshake errors.
                    error instanceof Deno.errors.InvalidData ||
                    error instanceof Deno.errors.UnexpectedEof ||
                    error instanceof Deno.errors.ConnectionReset ||
                    error instanceof Deno.errors.NotConnected
                ) {
                    // Backoff after transient errors to allow time for the system to
                    // recover, and avoid blocking up the event loop with a continuously
                    // running loop.
                    if (!acceptBackoffDelay) {
                        acceptBackoffDelay = _DEFAULT_.INITIAL_ACCEPT_BACKOFF_DELAY;
                    } else {
                        acceptBackoffDelay *= 2;
                    }

                    if (acceptBackoffDelay >= _DEFAULT_.MAX_ACCEPT_BACKOFF_DELAY) {
                        acceptBackoffDelay = _DEFAULT_.MAX_ACCEPT_BACKOFF_DELAY;
                    }

                    await delay(acceptBackoffDelay);

                    continue;
                }

                throw error;
            }

            acceptBackoffDelay = undefined;

            // "Upgrade" the network connection into an HTTP connection.
            let httpConnection: Deno.HttpConn;

            try {
                httpConnection = Deno.serveHttp(connection);
            } catch {
                // Connection has been closed.
                continue;
            }

            // Closing the underlying listener will not close HTTP connections, so we
            // track for closure upon server close.
            this.trackHttpConnection(httpConnection);

            const connectionInfo: IConnectionInfo = {
                localAddr: connection.localAddr,
                remoteAddr: connection.remoteAddr,
            };

            // Serve the requests that arrive on the just-accepted connection. Note
            // we do not await this async method to allow the server to accept new
            // connections.
            this.http(httpConnection, connectionInfo);
        }
    }

    protected close(): void {
        if (this._closedConnection_) throw new Deno.errors.Http(_DEFAULT_.ERROR_SERVER_CLOSED)

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
                // Yield the new HTTP request on the connection.
                requestEvent = await httpConnection.nextRequest();
            } catch {
                // Connection has been closed.
                break;
            }

            if (requestEvent === null) {
                // Connection has been closed.
                break;
            }

            // Respond to the request. Note we do not await this async method to
            // allow the connection to handle multiple requests in the case of h2.
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
            // Handle the request event, generating a response.
            response = await handle.getHandleRequest(handle.getRequest(request), connectionInfo);
        } catch (error: unknown) {
            request = requestEvent.request;
            // Invoke onError handler when request handler throws.
            response = await handle.getHandleError(error);
        }

        try {
            // Send the response.
            await requestEvent.respondWith(response);
        } catch {
            // respondWith() fails when the connection has already been closed, or there is some
            // other error with responding on this connection that prompts us to
            // close it and open a new connection.
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