import { Fecade } from './facade.ts';
import { useFacade } from '../utils/index.ts';
import  { TStorage } from '../@types/storage.types.ts';

class StorageFecade extends Fecade {
    constructor() {
        super("storage");
    }
}

export const Storage: TStorage = useFacade(StorageFecade);