import { IAppSetting } from '../@types/interfaces/app.interface.ts';

import { TConstructor } from '../@types/types/utils.type.ts';

import { IConfig } from '../@types/interfaces/config.interface.ts';

import app from '../index.ts';

export default class App {
    private static __app = app;

    public static async initApp() {
        await this.__app.initServices();
        await this.__app.initProviders();
    }

    public static registerService(name: string, service: TConstructor) {
        this.__app.registerService(name, service);
    }

    public static registerProvider(name: string, service: TConstructor) {
        this.__app.registerProvider(name, service);
    }

    public static registerConfig(name: string, config: IConfig) {
        this.__app.registerConfig(name, config);
    }

    public static getService<C>(name: string): C {
        return this.__app.getService(name);
    }

    public static setting(setting: IAppSetting) {
        this.__app.loadSetting(setting);
    }
}