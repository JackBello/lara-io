import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';

class ViewFecade extends Fecade {
    constructor() {
        super("template/engine");
    }
}

export const View = useFacade(ViewFecade);