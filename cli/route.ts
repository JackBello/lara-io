// deno-lint-ignore-file no-explicit-any
import { Table } from "https://deno.land/x/tbl@1.0.3/mod.ts";

import { Application } from "../framework/foundation/application.ts";
import { RouterService } from "../framework/services/router/router.service.ts";

export default async function route(path: string, flags: any) {
    const urlPath = `file:///${path}\\app\\index.ts`.replace(/\\/g, "/");

    const app: Application = (await import(urlPath)).default;

    const router: RouterService = app.service("router");

    if (flags.list) {
        const mapRoutes = router.routes.map(route => ({
            domain: route.domain,
            uri: route.uri,
            name: route.name,
            redirect: route.redirect ? "YES" : "NO",
            method: Array.isArray(route.method) ? route.method.join(" | ") : route.method,
            action() {
                if (typeof route.handler === "string") {
                    const [controller, action] = route.handler.split("@");

                    return `${controller}:${action}`;
                } else if (Array.isArray(route.handler)) {
                    const controller = route.handler[0].name;
                    const action = route.handler[1];

                    return `${controller}:${action}`;
                } else {
                    if(route.handler.name) {
                        return `${route.handler.name}`;
                    } else {
                        return "anonymous";
                    }
                }
            },
            middlewares() {
                if (route.middlewares) {
                    if (typeof route.middlewares === "string") {
                        return route.middlewares;
                    } else if (Array.isArray(route.middlewares)) {
                        return route.middlewares.map(middleware => {
                            if (middleware.name) {
                                return middleware.name;
                            } else {
                                return "anonymous";
                            }
                        }).join(", ");
                    } else {
                        if (route.middlewares.name) {
                            return route.middlewares.name;
                        } else {
                            return "anonymous";
                        }
                    }
                } else {
                    return "";
                }
            }
        }));

        const tableRoutes = new Table({
            header: ["Domain", "URI", "Name", "Redirect", "Method(s)", "Action", "Middleware(s)"],
        });

        mapRoutes.forEach(route => tableRoutes.push([route.domain, route.uri, route.name, route.redirect, route.method, route.action(), route.middlewares()]));

        console.log(tableRoutes.toString());
    } else {
        console.log("No action specified");
    }
}
