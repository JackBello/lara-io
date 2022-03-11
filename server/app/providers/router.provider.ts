import Provider from '../../../lib/@types/abstracts/provider.abstract.ts';

import { getBasePath } from '../../../lib/utils/path.ts';

import Route from '../../../lib/fecades/route.facade.ts';

export default class RouterProvider extends Provider {
    protected async boot() {
        await Route.group(getBasePath("server/router/web/index.ts"));
    }
}