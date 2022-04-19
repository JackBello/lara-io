import { Route } from '@lara-io/fecades';

import { TRequestService } from '../../../lib/@types/request.type.ts';

import HomeController from '../../app/http/controllers/home.controller.ts';

Route.get("/", "index", [HomeController, "index"]);

await Route.view("/atom", "test", { data: "Welcome", name: "Deno", history: "papa" });

await Route.view("/atom2", "home.ts");

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
