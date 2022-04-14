import { Provider } from '@lara-io/core';

import { getBasePath } from '@lara-io/utils';

import { Route } from '@lara-io/fecades';

export default class RoutesProvider extends Provider {
    protected async boot() {
        await Route.group(getBasePath("src/router/web/index.ts"));

        await Route.prefix("api").group(getBasePath("src/router/api/index.ts"));
    }
}