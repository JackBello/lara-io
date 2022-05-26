import { FundationProvider } from '@lara-io/providers';
import { ApplicationConfig } from '@lara-io/types';

import RoutesProvider from '../app/providers/routes.provider.ts';
import TemplatesProvider from '../app/providers/templates.provider.ts'

export default (): ApplicationConfig => ({
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
        },
        {
            name: "templates",
            instance: TemplatesProvider
        }
    ],

    configs: [],

    isDebug: true
});