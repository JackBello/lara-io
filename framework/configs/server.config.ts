import { ServerConfig } from '../modules/types.ts';

/**
 * Server configuration.
 * 
 * in this example we will use the default configuration.
 *  - hostname: localhost
 *  - port: 80
 *  - transport: tcp
 * 
 * @returns {ServerConfig} return server configuration.
*/

export default (): ServerConfig => ({
    /*
    |- server hostname -|
    |- default: localhost -|
    this value will be used to bind the server to a specific hostname.
    */
    hostname: "localhost",

    /*
    |- server port -|
    |- default: 80 -|
    this value will be used to bind the server to a specific port.
    */
    port: 80,

    /*
    |- server transport -|
    |- default: tcp -|
    this value will be used to bind the server to a specific transport.
    */
    transport: "tcp",
});