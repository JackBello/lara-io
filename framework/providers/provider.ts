// deno-lint-ignore-file no-explicit-any
import { Application } from '../fundation/application.ts';

/**
 * This is file of class provider.
 */
export abstract class Provider {
    /**
     * the application instance
     */
    protected app: Application;

    /**
     * list of listeners
     */
    protected listen: any[] = [];

    /**
     * 
     * @param app the application instance
     */
    constructor(app: Application) {
        this.app = app;
    }
    
    protected register() {
        
    }

    protected boot() {

    }

    protected shutdown() {

    }
}