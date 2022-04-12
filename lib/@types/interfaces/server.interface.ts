export interface ISettingServer {
    port: number;
    hostname: string;
}

export interface IConnectionInfo {
    readonly remoteAddr: Deno.Addr;
    readonly localAddr: Deno.Addr;
}