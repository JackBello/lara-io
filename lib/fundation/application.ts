// deno-lint-ignore-file no-explicit-any
import { TSettingRegisterSevice } from '../@types/type/application.type.ts';

import { IAppConfig, IProviders, IServices, IConfigs } from '../@types/interfaces/configs.interface.ts';

import { Container } from '../container/container.ts';
import { Fecade } from '../fecades/facade.ts';

import { Reflect } from '../dep.ts';

export class Application {
    protected instance: Application = this;

    protected _name_: string;
    protected _customs: string[];
    protected _configs: string[];
    protected _services: string[];
    protected _providers: string[];
    protected __container: Container;

    constructor(name: string) {
        this._name_ = name;
        this._customs = [];
        this._configs = [];
        this._services = [];
        this._providers = [];
        this.__container = new Container();

        this.init();
    }

    protected init() {
        this.__container.singletonInstance("@app", this);

        Fecade.container = this.__container;
        Container.instance = this.__container;
    }

    public boot() {
        const { providers, services, paths, configs }: IAppConfig = this.config("app");

        this.registerConfig("paths", () => (paths));

        this.bootConfigs(configs);
        this.bootServices(services);
        this.bootProviders(providers);

        this.executeRegisterProviders();
        this.executeBootProviders();
    }

    protected bootConfigs(configs: IConfigs[]) {
        configs.forEach((config: IConfigs) => {
            this.registerConfig(config.name, config.instance);
        });
    }

    protected bootProviders(providers: IProviders[]) {
        providers.forEach(provider => {
            if (provider) this.registerProvider(provider.name, provider.instance);
        });
    }

    protected bootServices(services: IServices[]) {
        services.forEach(service => {
            if (service) this.registerService(service.name, service.instance, {
                isSingleton: true,
                isCallback: true,
                configService: {}
            });
        });
    }

    public use(name: string) {
        return this.__container.make(`@/${name}`, {});
    }

    public service(name: string) {
        return this.__container.make(`@service/${name}`, {});
    }

    public config(name: string) {
        return this.__container.make(`@config/${name}`, {});
    }

    public executeRegisterProviders() {
        this._providers.forEach(name => {
            this.__container.make(name, {}).register();
        });
    }

    public executeBootProviders() {
        this._providers.forEach(name => {
            this.__container.make(name, {}).boot();
        });
    }

    public resolveDependencies(target: any, methodName: string) {
        const paramsFunction = Reflect.getMetadata('design:paramtypes', target.prototype, methodName);
        
        if (!paramsFunction) return [];

        const paramsTypes = paramsFunction.map((type: any) => type.name)

        const resolve:any = [];

        const validateTypes: any = {
            "String": true,
            "Number": true,
            "Array": true,
            "Boolean": true,
            "Object": true,
            "Function": true,
        };
        
        let service;
        for(const paramType of paramsTypes) {
            if(!validateTypes[paramType]) {
                if (paramType.indexOf("Service") !== -1) {
                    service = this.service(paramType.replace("Service", "").toLowerCase());
                } else {
                    service = this.config(paramType.toLowerCase());
                }

                resolve.push(service);
            }

            if (validateTypes[paramType]) {
                resolve.push(paramType);
            }
        }

        return resolve;
    }

    public register(
        name: string,
        instance: any,
        settings: TSettingRegisterSevice = {
        configService: {},
        isCallback: true,
        isSingleton: false
    }) {
        if (settings.isSingleton) {
            if (settings.isCallback) {
                this.__container.singleton(`@/${name}`, () => {
                    return new instance();
                });
            } else {
                this.__container.singletonInstance(`@/${name}`, instance);
            }
        } else {
            if (settings.isCallback) {
                this.__container.bind(`@/${name}`, () => {
                    return new instance();
                });
            } else {
                this.__container.bindInstance(`@/${name}`, instance);
            }
        }

        this._customs.push(`@/${name}`);
    }

    public registerProvider(name: string, instance: any) {
        this.__container.bindInstance(`@provider/${name}`, new instance(this));
        this._providers.push(`@provider/${name}`);
    }

    public registerService(
        name: string,
        instance: any,
        settings: TSettingRegisterSevice = {
            configService: {},
            isCallback: true,
            isSingleton: false
        }
    ) {
        if (settings.isSingleton) {
            if (settings.isCallback) {
                this.__container.singleton(`@service/${name}`, () => {
                    return new instance(name, settings.configService, this);
                });
            } else {
                this.__container.singletonInstance(`@service/${name}`, instance);
            }
        } else {
            if (settings.isCallback) {
                this.__container.bind(`@service/${name}`, () => {
                    return new instance(name, settings.configService, this);
                });
            } else {
                this.__container.bindInstance(`@service/${name}`, instance);
            }
        }

        this._services.push(`@service/${name}`);
    }

    public registerConfig(name: string, instance: any) {
        this.__container.singleton(`@config/${name}`, instance);
        this._configs.push(`@config/${name}`);
    }

    public loadServices(services: any) {
        services.forEach((name: string, instance: any, settings: TSettingRegisterSevice) => {
            this.registerService(name, instance, settings);
        });
    }

    public loadProviders(providers: any) {
        providers.forEach((name: string, instance: any) => {
            this.registerProvider(name, instance);
        });
    }

    public loadConfigs(configs: any) {
        configs.forEach((name: string, instance: any) => {
            this.registerConfig(name, instance);
        });
    }
}