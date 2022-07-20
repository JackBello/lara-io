import { Fecade } from './facade.ts';
import { Application } from '../foundation/application.ts';
import { useFacade } from '../helpers/utils.ts';

class AppFecade extends Fecade {
    constructor() {
        super("app");
    }
}

export const App: Application = useFacade(AppFecade);
