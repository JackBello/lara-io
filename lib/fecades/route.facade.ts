import app from '../index.ts';

import Router from '../router/index.router.ts';

import { ISettingRoute } from '../@types/interfaces/router.interface.ts';

import { TCallbackRoute, TCallbackGroup } from '../@types/types/router.type.ts';

export default class Route {
    protected static __router (): Router {
        return app.getService<Router>("router");
    }

    public static add(setting: ISettingRoute, callback: TCallbackRoute) {        
        this.__router().add(setting, callback);
    }

    public static async group(callback: string | TCallbackGroup) {
        await this.__router().group(callback);
    }
}