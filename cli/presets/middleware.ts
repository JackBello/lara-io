// deno-lint-ignore-file no-explicit-any
const middlewareClass = `
export default class %NAME% {
    public handle(context: any, next: any) {
        next();
    }
}
`;

const middlewareFunction = `
export default function %NAME%(context: any, next: any) {
    next();
}
`
const middlewareDefault = `
const %NAME% = (context: any, next: any) => {
    next();
}

export default %NAME%;
`;

export function presetMiddleware(name: any, type: string) {
    if (type === "class") {
        return middlewareClass.replace(/\%NAME\%/g, name);
    } else if (type === "function") {
        return middlewareFunction.replace(/\%NAME\%/g, name);
    } else {
        return middlewareDefault.replace(/\%NAME\%/g, name);
    }
}
