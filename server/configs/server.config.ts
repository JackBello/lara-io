import { IConfig } from '../../lib/@types/interfaces/config.interface.ts';

const config: IConfig = {
    name: "server",
    ref: "service-router",
    type: "service",

    server: {
        port: 9090,
        hostname: "localhost"
    }
}

export default config;