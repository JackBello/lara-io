import { IRouterConfig } from '../../lib/@types/interfaces/router.interface.ts';

export default (): IRouterConfig => ({
    strict: true,

    files: [
        {
            path: "src/routes/web/index.ts",
        },
        {
            path: "src/routes/api/index.ts",
            subdomain: "api"
        }
    ]
})