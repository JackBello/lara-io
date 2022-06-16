import { Fecade } from './facade.ts';
import { useFacade } from '../helpers/utils.ts';
import  { TStorage } from '../modules/types.ts';

class StorageFecade extends Fecade {
    constructor() {
        super("storage");
    }
}

export const Storage: TStorage = useFacade(StorageFecade);
