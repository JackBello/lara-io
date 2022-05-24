// deno-lint-ignore-file no-explicit-any
import { Application } from '../fundation/application.ts';

export abstract class Provider {
    protected app: Application;

    protected listen: any[] = [];

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