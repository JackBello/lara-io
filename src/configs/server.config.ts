import { ServerConfig } from '@lara-io/types';

export default (): ServerConfig => ({
    hostname: "localhost",
    port: 80,
    transport: "tcp",
});