// deno-lint-ignore-file no-explicit-any
// import { Inject } from '@lara-io/utils';

export default class HomeController {
    index(request: any) {
        console.log(request.fullUrl);
        
        return "Hello jack";
    }
}