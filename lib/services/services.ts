// deno-lint-ignore-file no-explicit-any
import { Application } from '../fundation/application.ts';

export class Service {
    protected serviceName: string;
    protected settings: any;
    protected app: Application;

    constructor(name: string, settings: any, app: Application) {
        this.serviceName = name;
        this.settings = settings;
        this.app = app;
    }
}
