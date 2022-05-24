import { Provider } from '@lara-io/core';

export default class RoutesProvider extends Provider {
    protected boot() {
        const $templateEngine = this.app.service('template/engine');

        $templateEngine.registerGlobal('denoVersion', Deno.version);

        $templateEngine.registerGlobal('testFunction', (a: string, b: string) => {
            return a + b;
        });

        $templateEngine.registerGlobal("buttonLink", (text: string, url: string, classes = "") => {
            return `<a href="${url}" class="btn btn-primary ${classes}">${text}</a>`;
        });
    }
}