// home.atom.ts function - template
export default () => (`
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>{{ data }}</h1>

            <p>{{ name }}</p>

            {{ history().currentRoute.uri }}
        </body>
    </html>
`);

// home.atom.ts function
/*
export default () => {
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
                <h1>{{data}}</h1>

                $for(let i of [1, 2, 3])
                    <h1>{{i}}</h1>
                $endfor

                <p>
                    {{ name }}
                </p>

                {{ history().currentRoute.uri }}
            </body>
        </html>
    `)
}
*/

// home.atom.ts class
/*
export default class HomeView {
    public render(): string {
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
                    <h1>{{data}}</h1>

                    $for(let i of [1, 2, 3])
                        <h1>{{i}}</h1>
                    $endfor

                    <p>
                        {{ name }}
                    </p>

                    {{ history().currentRoute.uri }}
                </body>
            </html>
        `);
    }
}
*/

// home.atom;
/*
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>{{data}}</h1>

            $for(let i of [1, 2, 3])
                <h1>{{i}}</h1>
            $endfor

            <p>
                {{ name }}
            </p>

            {{ history().currentRoute.uri }}
        </body>
    </html>

*/