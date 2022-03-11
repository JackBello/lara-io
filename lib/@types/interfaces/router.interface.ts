import { TMethodHTTP } from '../types/http.type.ts';
import { TCallbackRoute } from '../types/router.type.ts';

export interface IRoute {
    uri: string,
    name?: string,
    method?: TMethodHTTP | Array<TMethodHTTP>;
    middleware?: string;
    pattern?: string;
    controller: TCallbackRoute;
}

export interface ISettingRoute {
    uri?: string;
    method?: TMethodHTTP | Array<TMethodHTTP>;
    middleware?: string;
    name?: string;
    pattern?: string;
}