import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';
import { TRouter } from '../modules/types.ts';

class RouteFecade extends Fecade {
    constructor() {
        super("router");
    }
}

export const Route: TRouter = useFacade(RouteFecade);