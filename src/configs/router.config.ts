import { RouterConfig } from '@lara-io/types';

export default (): RouterConfig => ({
    strict: true,
    indexes: true,

    files: [
        {
            path: "src/routes/web/index.ts",
        },
        {
            path: "src/routes/api/index.ts",
            subdomain: "api"
        }
    ]
});