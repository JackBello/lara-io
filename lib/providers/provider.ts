import { Application } from '../fundation/application.ts';

export abstract class Provider {
    protected app: Application;

    constructor(app: Application) {
        this.app = app;
    }
    
    protected register() {
        
    }

    protected boot() {

    }
}