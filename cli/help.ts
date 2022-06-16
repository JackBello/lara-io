const MAIN_HELP = `
lara-io-cli

USAGE:
    lara-io [OPTIONS] [SUBCOMMAND]

SUBCOMMANDS:
    create [name]
        Create a new Lara project

    serve
        Manage your Lara project

    route
        Manage your routes

    storage
        Manage your storage

OPTIONS:
    --help, -h
        Show help

    --version, -v
        Show version
`;

export default function help(action?:string) {
    if (action) {
        if (action === "create") {
            console.log("Create a new Lara project");
        }
    } else {
        console.log(MAIN_HELP);
    }
}
