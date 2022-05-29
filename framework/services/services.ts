// deno-lint-ignore-file no-explicit-any
import { Application } from '../fundation/application.ts';

/**
 * This is file of class service.
 */
export class Service {
    /**
     * the name of the service
     */
    protected serviceName: string;

    /**
     * the settings of the service
     */
    protected settings: any;

    /**
     * the application instance
     */
    protected app: Application;

    /**
     * This class is used to register services in the application.
     * 
     * @param name the name of the service
     * @param settings the settings of the service
     * @param app the application instance
     */
    constructor(name: string, settings: any, app: Application) {
        this.serviceName = name;
        this.settings = settings;
        this.app = app;
    }
}
