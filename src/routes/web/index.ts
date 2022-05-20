import { Route } from '@lara-io/fecades';

import { TRequestService } from '../../../lib/@types/request.type.ts';

import HomeController from '../../app/http/controllers/home.controller.ts';

import { Streams } from '../../../lib/dep.ts';

import { publicPath } from '@lara-io/helpers';

const { readableStreamFromReader } = Streams;

Route.get("/", "index", [HomeController, "index"]);

await Route.view("/atom", "test", { data: "Welcome", name: "Deno", history: "papa" });

await Route.view("/atom2", "home.ts");

Route.get("/contact", "contact", () => {
    return "contact";
});

Route.get("/download", "download", () => {
    let file: Deno.FsFile;

    try {
        file = Deno.openSync(publicPath("images/101854.jpg"), { read: true });

        return new Response(readableStreamFromReader(file), { 
            headers: { 
                "content-type": "image/jpeg",
                "content-disposition": "attachment; filename=101854.jpg"
            },
            status: 200 });
    } catch (error) {
        console.log(error);
        return new Response("File not found", { status: 404 });
    }

});

Route.redirect("/my-user", "/user");

Route.prefix("user").group(() => {
    Route.get("", "user.index", () => {
        return "user";
    });

    Route.get("/{id?}/{type?}", "user.id", (id: number, type: string) => {
        if (type) {
            return `user ${id} ${type}`;
        }
        return "user id: " + id;
    });

    Route.get("/contact", "user.contact", () => {
        return "user contact";
    });
});

Route.get("/cars", "cars", (request: TRequestService) => {
    console.log(request);

    return "cars";
});

Route.get("/about", "about", () => {
    return "about";
});

Route.get("/json", "json", () => {
    return true
});