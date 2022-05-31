export default () => (`
@code
    let pathname = $path;

    if (pathname.endsWith('/')) pathname = pathname;
    else pathname = pathname + '/';
@endcode
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Index of {{ pathname }}</title>

        <style>
            .icon {
                padding-left: 25px;
            }

            .file-icon {
                background : url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAIAAACQkWg2AAAABnRSTlMAAAAAAABupgeRAAABEElEQVR42nRRx3HDMBC846AHZ7sP54BmWAyrsP588qnwlhqw/k4v5ZwWxM1hzmGRgV1cYqrRarXoH2w2m6qqiqKIR6cPtzc3xMSML2Te7XZZlnW7Pe/91/dX47WRBHuA9oyGmRknzGDjab1ePzw8bLfb6WRalmW4ip9FDVpYSWZgOp12Oh3nXJ7nxoJSGEciteP9y+fH52q1euv38WosqA6T2gGOT44vry7BEQtJkMAMMpa6JagAMcUfWYa4hkkzAc7fFlSjwqCoOUYAF5RjHZPVCFBOtSBGfgUDji3c3jpibeEMQhIMh8NwshqyRsBJgvF4jMs/YlVR5KhgNpuBLzk0OcUiR3CMhcPaOzsZiAAA/AjmaB3WZIkAAAAASUVORK5CYII=") left top no-repeat;
            }

            .dir-icon {
                background : url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABt0lEQVR42oxStZoWQRCs2cXdHTLcHZ6EjAwnQWIkJyQlRt4Cd3d3d1n5d7q7ju1zv/q+mh6taQsk8fn29kPDRo87SDMQcNAUJgIQkBjdAoRKdXjm2mOH0AqS+PlkP8sfp0h93iu/PDji9s2FzSSJVg5ykZqWgfGRr9rAAAQiDFoB1OfyESZEB7iAI0lHwLREQBcQQKqo8p+gNUCguwCNAAUQAcFOb0NNGjT+BbUC2YsHZpWLhC6/m0chqIoM1LKbQIIBwlTQE1xAo9QDGDPYf6rkTpPc92gCUYVJAZjhyZltJ95f3zuvLYRGWWCUNkDL2333McBh4kaLlxg+aTmyL7c2xTjkN4Bt7oE3DBP/3SRz65R/bkmBRPGzcRNHYuzMjaj+fdnaFoJUEdTSXfaHbe7XNnMPyqryPcmfY+zURaAB7SHk9cXSH4fQ5rojgCAVIuqCNWgRhLYLhJB4k3iZfIPtnQiCpjAzeBIRXMA6emAqoEbQSoDdGxFUrxS1AYcpaNbBgyQBGJEOnYOeENKR/iAd1npusI4C75/c3539+nbUjOgZV5CkAU27df40lH+agUdIuA/EAgDmZnwZlhDc0wAAAABJRU5ErkJggg==") left top no-repeat;
            }
        </style>

        <script>
            function parseFileSize(bytes, si=false, dp=1) {
                const thresh = si ? 1000 : 1024;

                if (Math.abs(bytes) < thresh) {
                    return bytes + ' B';
                }

                const units = si
                    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
                    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

                let u = -1;

                const r = 10**dp;

                do {
                    bytes /= thresh;
                    ++u;
                } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
                return bytes.toFixed(dp) + ' ' + units[u];
            }

            function parseFileDate(timestamp) {
                const date = new Date(Number(timestamp));

                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hours = date.getHours();
                const minutes = date.getMinutes();
                const seconds = date.getSeconds();

                return year + '/' + month + '/' + day + ' - ' + hours + ':' + minutes + ':' + seconds;
            }
        </script>
    </head>

    <body>
        <h1>Index of {{ pathname }}</h1>
        <hr/>
        <table>
            <thead>
                <tr>
                    <th style="text-align: left;">Name</th>
                    <th style="text-align: right;">Size</th>
                    <th style="text-align: right;">Last Modified</th>
                </tr>
            </thead>
            <tbody>
                @for(const object of $content)
                    <tr class="fs-element">
                        <td style="padding-right: 14px;">
                            <a class="icon {{ object.type === "file" ? 'file-icon' : 'dir-icon' }}" href="{{ request().baseUrl + pathname + object.name }}">{{ object.name }}</a>
                        </td>
                        <td style="padding-left: 14px; text-align: right;">
                            {{ object.type === "file" ? object.size : "" }}
                        </td>
                        <td style="padding-left: 14px; text-align: right;">
                            {{ object.lastModified }}
                        </td>
                    </tr>
                @endfor
            </tbody>
        </table>

        <script>
            const fsList = document.querySelectorAll(".fs-element");

            for(const fsElement of fsList) {
                if (fsElement.children[0].children[0].classList.contains("file-icon")) fsElement.children[1].innerHTML = parseFileSize(fsElement.children[1].innerHTML);

                fsElement.children[2].innerHTML = parseFileDate(fsElement.children[2].innerHTML);
            }
        </script>
    </body>
</html>
`)
