// deno-lint-ignore-file no-explicit-any
import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12/mod.ts";

export function Inject(name: string) {
    return function (target: any, key: string, index?: number) {
        if (name) {
            if (index !== undefined) {
                if (typeof target[key] === "function") {
                    Reflect.defineMetadata(`inject-service-param:${index}`, {
                        name: "service",
                        inject: name,
                        position: index,
                    }, target, key);
                }
            } else {
                Reflect.defineMetadata(`inject-service-property:${key}`, {
                    name: "service",
                    inject: name,
                    property: key
                }, target);
            }
        } else {
            throw new Error("the name not specified to Inject")
        }
    };
}

export function Use(name: string) {
    return function (target: any, key: string, index?: number) {
        if (name) {
            if (index !== undefined) {
                if (typeof target[key] === "function") {
                    Reflect.defineMetadata(`inject-service-param:${index}`, {
                        name: "use",
                        inject: name,
                        position: index,
                    }, target, key);
                }
            } else {
                Reflect.defineMetadata(`inject-service-property:${key}`, {
                    name: "use",
                    inject: name,
                    property: key
                }, target);
            }
        } else {
            throw new Error("the name not specified to Use")
        }
    };
}

export function Request() {
    return function (target: any, key: string, index?: number) {
        if (index) {
            //
        } else {
            Reflect.defineMetadata(`inject-service-property:${key}`, {
                name: "use",
                inject: "http/request",
                property: key
            }, target);
        }
    };
}

export function Response() {
    return function (target: any, key: string, index?: number) {
        if (index) {
            //
        } else {
            Reflect.defineMetadata(`inject-service-property:${key}`, {
                name: "use",
                inject: "http/response",
                property: key
            }, target);
        }
    };
}
