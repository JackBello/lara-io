import { Inject } from '@lara-io/utils';

export default class HomeController {
    @Inject
    index() {
        return "Hello jack";
    }
}