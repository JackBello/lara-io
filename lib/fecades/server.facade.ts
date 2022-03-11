import app from '../index.ts';

import Server from '../server/index.server.ts';

import { TCallbackRequest } from '../@types/types/request.type.ts';

export default class Serve {
    private static __serve(): Server {
        return app.getService<Server>("server")
    }

    public static async initServer() {
        await this.__serve().initServer();
    }

    public static loadRequest(callback: TCallbackRequest) {
        this.__serve().applyHandleRequest(callback);
    }
}