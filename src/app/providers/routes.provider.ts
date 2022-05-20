import { Provider } from '@lara-io/core';

import { getBasePath } from '@lara-io/utils';

import { Route } from '@lara-io/fecades';

export default class RoutesProvider extends Provider {
    protected async boot() {
        const $router = this.app.service('router');

        const { files, strict } = this.app.config('router');
        const { hostname } = this.app.config('server');

        $router.setStrict(strict);

        for(const file of files) {
            const path = getBasePath(file.path);

            if(file.subdomain && file.prefix) {
                await Route.domain(`${file.subdomain}.${hostname}`).prefix(file.prefix).group(path);
            } else if(file.subdomain && !file.prefix) {
                await Route.domain(`${file.subdomain}.${hostname}`).group(path);
            } else if(!file.subdomain && file.prefix) {
                await Route.prefix(file.prefix).group(path);
            } else {
                await Route.group(path);
            }
        }
    }
}