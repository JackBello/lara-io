import { IRouterConfig } from '../../lib/@types/interfaces/router.interface.ts';

export default (): IRouterConfig => ({
    mode: "hash",

    files: [
        {
            name: "web",
            path: "src/router/web/index.ts",
        }
    ]
})