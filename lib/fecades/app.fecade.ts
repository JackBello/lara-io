import { Fecade } from './facade.ts';
import { Application } from '../fundation/application.ts';
import { useFacade } from '../utils/index.ts';

class AppFecade extends Fecade {
    constructor() {
        super("app");
    }
}

export const App: Application = useFacade(AppFecade);