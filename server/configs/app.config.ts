import { IAppConfig } from '../../lib/@types/interfaces/app.interface.ts';

import env from '../../lib/utils/env.ts';

import Server from '../../lib/server/index.server.ts';
import Router from '../../lib/router/index.router.ts';

import ServerProvider from '../app/providers/server.provider.ts'
import RouterProvider from '../app/providers/router.provider.ts';

const config: IAppConfig = {
    name: env("APP_NAME", "test1"),

    env: env("APP_ENV", "production"),

    services: [
        {
            name: "server",
            constructor: Server
        },
        {
            name: "router",
            constructor: Router
        }
    ],

    providers: [
        {
            name: "server",
            constructor: ServerProvider
        },
        {
            name: "router",
            constructor: RouterProvider
        }
    ]
}

export default config;