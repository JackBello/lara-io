import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';
import { THttpRequest } from '../@types/request.type.ts';

class RequestFecade extends Fecade {
    constructor() {
        super("@/request");
    }
}

export const HttpRequest: THttpRequest = useFacade(RequestFecade);
