import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';
import { TRoute } from '../@types/router.types.ts';

class RouteFecade extends Fecade {
    constructor() {
        super("router");
    }
}

export const Route: TRoute = useFacade(RouteFecade);