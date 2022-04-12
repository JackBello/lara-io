import { IRouterConfig } from '../../lib/@types/interfaces/router.interface.ts';

export default (): IRouterConfig => ({
    mode: "hash",

    files: [
        {
            name: "web",
            subdomain: "www",
            path: "src/router/web/index.ts",
            uri: "/",
        }
    ],

    routes: []
})