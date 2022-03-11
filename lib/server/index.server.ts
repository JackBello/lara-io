import { ISettingServer } from '../@types/interfaces/server.interface.ts';
import { TCallbackRequest } from '../@types/types/request.type.ts';
import { IConfig } from '../@types/interfaces/config.interface.ts';

export default class Server {
    protected __server: Deno.Listener;
    protected __handleRequest: TCallbackRequest | undefined;
    protected __handleResponse: Response | undefined;
    protected __handleError: undefined;
    public name = "service-server";

    constructor(config: IConfig) {
        const server:ISettingServer = config.server;

        this.__server = Deno.listen({
            hostname: server.hostname,
            port: server.port
        });
    }

    public applyHandleExceptions() {
        
    }

    public applyHandleResponse(response: Response) {
        this.__handleResponse = response;
    }

    public applyHandleRequest(callback: TCallbackRequest) {
        this.__handleRequest = callback;
    }

    protected async handleConnections(connecion: Deno.Conn) {
        const httpConnection = Deno.serveHttp(connecion);

        if (!this.__handleRequest) {
            throw new Error("handle request undefined");
        }

        for await (const { request, respondWith } of httpConnection) {
            const response = this.__handleRequest(request);

            if (typeof response === 'string') {
                return await respondWith(new Response(response));
            }

            return await respondWith(response);
        }
    }

    public async initServer() {
        for await (const connectionAccept of this.__server) {
            try {
                await this.handleConnections(connectionAccept);
            } catch (error) {
                console.log(error);
            }
        }
    }
}