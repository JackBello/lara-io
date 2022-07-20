// deno-lint-ignore-file no-explicit-any
export class HttpProxy {
    public async request(url: string, options: any) {
        const client = Deno.createHttpClient({
            proxy: {
                url
            }
        });

        const headers = new Headers();

        headers.append("X-Forwarded-For", url)
        headers.append("X-Forwarded-Port", options.port);
        headers.append("X-Forwarded-Proto", options.protocol);
        headers.append("X-Forwarded-Host", options.url);

        const proxy = await fetch(options.url, {
            client,
            headers
        });

        console.log(proxy);

        return await proxy.text();
    }
}
