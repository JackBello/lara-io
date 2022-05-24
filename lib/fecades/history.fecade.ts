import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';
import { THistory } from '../modules/types.ts';

class HistoryFecade extends Fecade {
    constructor() {
        super("router/history");
    }
}

export const History: THistory = useFacade(HistoryFecade);