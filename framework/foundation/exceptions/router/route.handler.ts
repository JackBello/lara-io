import { template } from '../../../helpers/miscellaneous.ts';
import { StatusText } from '../../http/http-status.ts';
import ErrorHttpPage from '../../templates/error/index.ts';

export default async function RouteHandler(message: string, status: number) {
    const hasView = await template().exists(`@templates/error/index`);

    let view: string;

    const text = StatusText[status];

    if (hasView) {
        view = await template().view("@templates/error/index", {message, status, text});
    } else {
        const html = ErrorHttpPage;

        view = await template().render(html, {message, status, text});
    }

    return new Response(view, { headers: { "Content-Type": "text/html" }, status });
}
