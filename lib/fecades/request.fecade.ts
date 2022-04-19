import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';
import { TRequestService } from '../@types/request.type.ts';

class RequestFecade extends Fecade {
    constructor() {
        super("@/request");
    }
}

export const Request: TRequestService = useFacade(RequestFecade);
