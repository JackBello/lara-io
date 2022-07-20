// deno-lint-ignore-file no-explicit-any
import { Reflect } from "https://deno.land/x/reflect_metadata@v0.1.12/mod.ts";
import { service, use, request } from '../helpers/miscellaneous.ts';

function parseParamsFunction(func: string) {
    const args = /\(\s*([^)]+?)\s*\)/.exec(func);

    let result: string [] = [];

    if (args) result = args[1].split(/\s*,\s*/);

    return result;
}

export function injectPropertiesToController(target: any) {
    const informationInject = Reflect.getMetadataKeys(target);

    const properties: string[] = [];
    const injectionsProperties: any = {}

    for (const type of informationInject) {
        let key;

        if (type.startsWith("inject-service-property")) {
            key = type.split(":")[1];
            properties.push(key);
            injectionsProperties[key] = Reflect.getMetadata(type, target)
        }
    }

    properties.forEach((property: string) => {
        const select = injectionsProperties[property];

        if (select.name === "service") {
            Object.defineProperty(target, select.property, {
                get: () => service(select.inject),
                enumerable: true,
                configurable: true
            });
        } else if (select.name === "use") {
            Object.defineProperty(target, select.property, {
                get: () => use(select.inject),
                enumerable: true,
                configurable: true
            });
        }
    });
}

export function injectParamsToController(target: any, method: string): any[] {
    const informationInject = Reflect.getMetadataKeys(target, method);

    const injectionsParams: any = {}
    const inject: any[] = [];
    const paramsFunction = parseParamsFunction(target[method].toString());

    for (const type of informationInject) {
        let key;

        if (type.startsWith("inject-service-param")) {
            key = type.split(":")[1]
            injectionsParams[key] = Reflect.getMetadata(type, target, method)
        }
    }

    paramsFunction.forEach((param: string, index: number) => {
        const select = injectionsParams[`${index}`];

        if (select) {
            if (select.name === "service") {
                inject.push(service(select.inject))
            } else if (select.name === "use") {
                inject.push(use(select.inject))
            }
        } else {
            if (request().hasParam(param)) {
                inject.push(request().params[param]);
            } else {
                inject.push(undefined)
            }
        }
    });

    return inject;
}
