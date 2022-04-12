import { Provider } from '../../../lib/core.ts';

import { getBasePath } from '../../../lib/utils.ts';

import { Route } from '../../../lib/fecades.ts';

export default class RoutesProvider extends Provider {
    protected async boot() {
        await Route.group(getBasePath("src/router/web/index.ts"));
    }
}