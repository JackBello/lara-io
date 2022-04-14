import { FundationProvider } from '@lara-io/providers';

import { IAppConfig } from '../../lib/@types/interfaces/configs.interface.ts';

import RoutesProvider from '../app/providers/routes.provider.ts';

export default (): IAppConfig => ({
    name: "compureviews",

    paths: {
        app: "src/app",
        statics: "src/public",
        resources: "src/resources",
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