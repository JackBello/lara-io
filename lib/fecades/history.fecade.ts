import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';

class HistoryFecade extends Fecade {
    constructor() {
        super("router/history");
    }
}

export const History = useFacade(HistoryFecade);