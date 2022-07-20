import { PATH_FRAMEWORK } from '../../../dependencies.ts';

import { template } from '../../../helpers/miscellaneous.ts';
import { resourcePath } from '../../../helpers/paths.ts';
import { StatusText } from '../../http/http-status.ts';

export default async function RouteHandler(message: string, status: number) {
    const hasView = template().exists(`@templates/error/index`);

    let view: string, html: string;

    const text = StatusText[status];

    if (hasView) {
        html = await Deno.readTextFile(resourcePath(`@templates/error/index.atom`));

        view = await template().render(html, {message, status, text});
    } else {
        html = await Deno.readTextFile(`${PATH_FRAMEWORK}/fundation/templates/error/index.atom`);

        view = await template().render(html, {message, status, text});
    }

    return new Response(view, { headers: { "Content-Type": "text/html" }, status });
}
