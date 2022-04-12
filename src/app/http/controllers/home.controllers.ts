import { Inject } from '../../../../lib/utils.ts';

export default class HomeController {
    @Inject
    index() {
        return "Hello jack";
    }
}