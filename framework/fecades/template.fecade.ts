import { Fecade } from './facade.ts';
import { useFacade } from '../helpers/utils.ts';
import { TTemplate } from '../modules/types.ts';

class TemplateFecade extends Fecade {
    constructor() {
        super("template/engine");
    }
}

export const Template: TTemplate = useFacade(TemplateFecade);
