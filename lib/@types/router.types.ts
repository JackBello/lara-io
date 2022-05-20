// deno-lint-ignore-file no-explicit-any
import { TMethodHTTP } from './type/server.type.ts';

export type TRoute = {
    get: (uri: string, name: string, action: any) => void;
    post: (uri: string, name: string, action: any) => void;
    put: (uri: string, name: string, action: any) => void;
    delete: (uri: string, name: string, action: any) => void;
    patch: (uri: string, name: string, action: any) => void;
    match: (methods: TMethodHTTP, uri: string, name: string, action: any) => void;
    any: (uri: string, name: string, action: any) => void;
    
    middleware: (middleware: any) => TRoute;
    controller: (controller: any) => TRoute;
    domain: (domain: string) => TRoute;
    prefix: (prefix: string) => TRoute;
    name: (name: string) => TRoute;
    group: (action: any) => Promise<void>;

    redirect: (url: string, destination: string, code?: number) => any;
    permanentRedirect: (uri: string, destination: string) => any;

    view: (uri: string, view: string, data?: any) => Promise<void>;
}