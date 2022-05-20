import { FundationProvider } from '@lara-io/providers';

import { IAppConfig } from '../../lib/@types/interfaces/configs.interface.ts';

import RoutesProvider from '../app/providers/routes.provider.ts';

export default (): IAppConfig => ({
    name: "compureviews",

    app: {
        http: "src/app/http",
    },

    paths: {
        app: "src/app",
        configs: "src/configs",
        statics: "src/public",
        resources: "src/resources",
        router: "src/router",
        storage: "src/storage",
        database: "src/database",
        ecosystems: "src/ecosystems",
        packages: "src/packages",
    },

    services: [],

    providers: [
        {
            name: "fundation",
            instance: FundationProvider
        },
        {
            name: "routes",
            instance: RoutesProvider
        }
    ],

    aliases: {
        services: [
            {
                alias: "Router",
                service: "router"
            }
        ],
        fecades: [
            {
                alias: "Route",
            },
            {
                alias: "App",
            }
        ],
        helpers: [
            {
                alias: "app()"
            },
            {
                alias: "router()",
            },
            {
                alias: "history()",
            }
        ]
    },

    configs: [],

    isDebug: true
});