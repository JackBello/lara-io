import { IService } from './service.interface.ts';
import { IProvider } from './provider.interface.ts';

export interface IAppConfig {
    name: string | boolean | number;

    env: string | boolean | number;

    services: Array<IService>

    providers: Array<IProvider>
}

export interface IAppSetting {
    name: string | boolean | number;
    env: string | boolean | number;
}