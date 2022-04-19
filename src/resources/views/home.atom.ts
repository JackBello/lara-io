import { history } from '@lara-io/helpers'

export default () => {
    const { uri } = history().currentRoute;

    return (`
        <!DOCTYPE html>
        <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Document</title>
            </head>
            <body>
            ${uri}
            </body>
        </html>
    `)
}