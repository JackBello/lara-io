// deno-lint-ignore-file no-explicit-any
import { TAllMethodHTTP } from './type/server.type.ts';
import { IRoute } from './interfaces/router.interface.ts';

export type TRequestServer = {
    https: boolean,
    ssl_tls_sni: string,
    ssl_tls_key: string,
    ssl_tls_cert: string,
    http_host: string,
    http_port: number,
    http_connection: string,
    http_upgrade_insecure_requests: boolean,
    http_user_agent: string,
    http_accept: string,
    http_accept_encoding: string,
    http_accept_language: string,
    http_accept_charset: string,
    http_sec_gpc: string,
    http_sec_fetch_user: string,
    http_sec_fetch_dest: string,
    http_sec_fetch_mode: string,
    http_sec_fetch_site: string,
    server_name: string,
    server_software: string,
    server_protocol: string,
    server_signature: string,
    server_address: string,
    server_port: number,
    server_admin: string,
    os: string,
    os_root: string,
    os_command: string,
    romete_address: string,
    remote_port: number,
    request_method: TAllMethodHTTP,
    request_uri: string,
    request_time_float: number,
    request_time: number,
    script_filename: string,
    script_name: string,
    document_root: string,
}

export type TUploadedFile = {
    originalName: string,
    fileName: string | undefined,
    type: string,
    size: number,
    tmp: string | undefined,
    extension: string,
    mimeType: string,
    getContent(): Uint8Array,
    move(path: string, name?: string): void,
    save(path: string): void,
    saveAs(path: string, name: string): void,
}

export type THttpResponse = {};

export type THttpRequest = {
    headers: Record<string, string>;
    query: Record<string, string>;
    params: Record<string, string>;
    route: IRoute;
    body: any;
    files: Record<string, TUploadedFile>;
    cookies?: any[];
    server?: TRequestServer;
    session?: any;
    user?: any;
    method: TAllMethodHTTP;
    ip: string;
    baseUrl: string;
    baseUri: string;
    fullUrl: string;
}