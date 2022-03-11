import Route from '../../../lib/fecades/route.facade.ts';

Route.add({
    method: "GET",
    name: "hello",
    uri: "/"
}, () => {
    return "hello";
});

Route.add({
    method: "GET",
    name: "hello",
    uri: "/contact"
}, () => {
    return "contact";
});

Route.add({
    method: "GET",
    name: "hello",
    uri: "/about"
}, () => {
    return "about";
});

Route.add({
    method: "GET",
    name: "hello",
    uri: "/information"
}, () => {
    return "information";
});

Route.add({
    method: "GET",
    name: "hello",
    uri: "/test"
}, () => {
    return "test";
});