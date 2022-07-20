import { Fecade } from './facade.ts';
import { useFacade } from '../helpers/utils.ts';

class ProxyFecade extends Fecade {
    constructor() {
        super("@/http/proxy");
    }
}

export const HttpProxy = useFacade(ProxyFecade).request;
