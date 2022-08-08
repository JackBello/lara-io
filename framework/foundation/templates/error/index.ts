// deno-lint-ignore-file no-inferrable-types
const TEMPLATE: string = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8"/>
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>{{ $status }} - {{ $text }}</title>

        <style>
            body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100vh;
                background-color: #000c23;
                color: #00a9fa;
                display: flex;
                justify-content: center;
                align-items: center;
                font-family: 'Lato';
            }

            div {
                font-size: 2pc;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }

            h1 {
                font-weight: 800;
                letter-spacing: 0.3pc;
            }

            code {
                background-color: #00365f;
                padding: 10px 16px;
                border-radius: 20px;
                color: #fff;
            }
        </style>
    </head>
    <body>
        <div>
            <h1>{{ $status }} | {{ $text }}</h1>
            @if($message)
            <code><i>{{ $message }}</i></code>
            @endif
        </div>
    </body>
</html>
`;

export default TEMPLATE;
