import { Fecade } from './facade.ts';
import { useFacade } from '../helpers/utils.ts';
import { THttpResponse } from '../modules/types.ts';

class ResponseFecade extends Fecade {
    constructor() {
        super("@/http/response");
    }
}

export const HttpResponse: THttpResponse = useFacade(ResponseFecade);
