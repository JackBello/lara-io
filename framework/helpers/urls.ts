import { config } from './miscellaneous.ts';

let host;

export function json(path: string) {
    host = config("server").hostname;
    return `http://${host}/json${path.startsWith("/") ? path : "/"+path}`;
}

export function secureJson(path: string) {
    host = config("server").hostname;
    return `https://${host}/json${path.startsWith("/") ? path : "/"+path}`;
}

export function video(path: string) {
    host = config("server").hostname;
    return `http://${host}/videos${path.startsWith("/") ? path : "/"+path}`;
}

export function secureVideo(path: string) {
    host = config("server").hostname;
    return `https://${host}/videos${path.startsWith("/") ? path : "/"+path}`;
}

export function script(path: string) {
    host = config("server").hostname;
    return `http://${host}/js${path.startsWith("/") ? path : "/"+path}`;
}

export function secureScript(path: string) {
    host = config("server").hostname;
    return `https://${host}/js${path.startsWith("/") ? path : "/"+path}`;
}

export function css(path: string) {
    host = config("server").hostname;
    return `http://${host}/css${path.startsWith("/") ? path : "/"+path}`;
}

export function secureCss(path: string) {
    host = config("server").hostname;
    return `https://${host}/css${path.startsWith("/") ? path : "/"+path}`;
}

export function image(path: string) {
    host = config("server").hostname;
    return `http://${host}/image${path.startsWith("/") ? path : "/"+path}`;
}

export function secureImage(path: string) {
    host = config("server").hostname;
    return `https://${host}/images${path.startsWith("/") ? path : "/"+path}`;
}

export function asset(path: string) {
    host = config("server").hostname;
    return `http://${host}${path.startsWith("/") ? path : "/"+path}`;
}

export function secureAsset(path: string) {
    host = config("server").hostname;
    return `https://${host}${path.startsWith("/") ? path : "/"+path}`;
}

export function ecosystem(type: string, path: string) {
    host = config("server").hostname;
    return `http://${host}/ecosystem/@${type}${path.startsWith("/") ? path : "/"+path}`;
}

export function secureEcosystem(type: string, path: string) {
    host = config("server").hostname;
    return `https://${host}/ecosystem/@${type}${path.startsWith("/") ? path : "/"+path}`;
}

export function url() {

}

export function secureUrl() {

}

export function route() {

}

export function action() {

}
