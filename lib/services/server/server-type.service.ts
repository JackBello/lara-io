// deno-lint-ignore-file no-inferrable-types
import { Service } from '../services.ts';

export class ServerTypeService extends Service {
    protected __httpsPort: number = 443;
    protected __httpPort: number = 80;

    public async listenAndServe() {

    }

    public async listenAndServeTLS() {
        
    }
}