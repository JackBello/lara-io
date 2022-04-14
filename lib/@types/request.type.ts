// deno-lint-ignore-file no-explicit-any
import { TAllMethodHTTP } from './type/server.type.ts';

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

export type TRequestService = {
    headers: Record<string, string>;
    query: Record<string, string>;
    body?: any[];
    files?: any[];
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