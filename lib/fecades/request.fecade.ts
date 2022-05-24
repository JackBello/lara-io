import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';
import { THttpRequest } from '../modules/types.ts';

class RequestFecade extends Fecade {
    constructor() {
        super("@/http/request");
    }
}

export const HttpRequest: THttpRequest = useFacade(RequestFecade);
