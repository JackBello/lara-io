import { IAppSetting } from '../@types/interfaces/app.interface.ts';

import { IConfig } from '../@types/interfaces/config.interface.ts';

import { TConstructor } from '../@types/types/utils.type.ts';

export default class App {
    protected __services: Map<string, TConstructor> = new Map();
    protected __providers: Map<string, TConstructor> = new Map();
    protected __configs: Map<string, IConfig> = new Map();
    protected __settign: IAppSetting | undefined;

    public loadSetting(setting: IAppSetting) {
        this.__settign = setting;
    }

    public registerService(name: string, service: TConstructor) {
        this.__services.set(name, service);
    }

    public registerProvider(name: string, provider: TConstructor) {
        this.__providers.set(name, provider);
    }

    public registerConfig(name: string, config: IConfig) {
        this.__configs.set(name, config);
    }

    public initService() {

    }

    public initProvider() {

    }

    public initServices() {
        return new Promise((resolve) => {
            this.__services.forEach((Service, name) => {
                const config = this.getConfig(name);
    
                if (config) this.__services.set(name, new Service(config));
                else this.__services.set(name, new Service())
            });

            resolve(true);
        })
    }

    public initProviders() {
        return new Promise((resolve) => {
            this.__providers.forEach((Provider, name) => {
                this.__providers.set(name, new Provider())
            });

            resolve(true);
        })
    }

    public showServices() {
        return this.__services;
    }

    public getService<C>(name: string): C {
        return this.__services.get(name);
    }

    public getProvider<C>(name: string): C {
        return this.__providers.get(name);
    }

    public getConfig(name: string) {
        return this.__configs.get(name);
    }

    public setConfig() {

    }
}