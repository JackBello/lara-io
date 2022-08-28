export class HttpProxy {
    public request(ref: string, request: Request, port: number, origin: string) {
        try {
            const patternProxy = new URL(ref);
            const patternOrigin = new URL(origin);

            const headers = new Headers();
            headers.append("X-Forwarded-For", ref)
            headers.append("X-Forwarded-Port", `${port}`);
            headers.append("X-Forwarded-Proto", patternProxy.protocol.slice(0,-1));
            headers.append("X-Forwarded-Host", origin);

            request.headers.forEach((value, key) => {
                headers.append(key, value);
            });

            const url = new URL(origin === request.url ? `${patternOrigin.protocol}//${patternOrigin.hostname}${patternOrigin.port ? `:${patternOrigin.port}` : ''}` : request.url);
            url.protocol = patternProxy.protocol;
            url.hostname = patternProxy.hostname;
            url.port = `${port}`;

            return fetch(url.href, {
                method: request.method,
                body: request.body,
                headers
            });
        } catch (exception) {
            console.log(exception);
        }
    }
}
