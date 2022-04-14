import { Route } from '@lara-io/fecades';

import { TRequestService } from '../../../lib/@types/request.type.ts';

// import HomeController from '../../app/http/controllers/home.controller.ts';

Route.get("/", "index", "home.controller@index");

Route.view("/home", "home", { data: "Welcome", name: "Deno" });

Route.get("/contact", "contact", () => {
    return "contact";
});

Route.prefix("user").group(() => {
    Route.get("/", "user.index", () => {
        return "user";
    });

    Route.get("/:id/:type?", "user.id", (id: number, type: string) => {
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
