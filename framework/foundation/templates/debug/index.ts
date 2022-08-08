// deno-lint-ignore-file no-inferrable-types
const TEMPLATE: string = `
<!DOCTYPE html>
<html lang="en">

<head>
    <title>LaraIO - Error</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            content: [],
            theme: {
                extend: {},
            },
            plugins: [],
        }
    </script>

</head>

<body class="w-full bg-gray-100">
    <div class="m-20">
        <div class="w-full bg-white p-5 shadow-md">
            <div class="mb-4 flex justify-between items-center">
                <span class="bg-slate-200 text-white py-1 px-3 text-slate-700 box-border block font-bold">{{ $name }}</span>
                <div>
                    <b class="bg-slate-200 text-white py-1 px-3 text-slate-700 box-border font-bold mx-1">Deno {{ Deno.version.deno }}</b>
                    <b class="bg-slate-200 text-white py-1 px-3 text-slate-700 box-border font-bold mx-1">LaraIO {{ 0.1 }}</b>
                </div>
            </div>
            <div class="font-bold text-2xl">
                {{ $message }}
            </div>
        </div>
        <div class="w-full bg-white shadow-md mt-10 grid grid-cols-2 gap-4">
            <div class="flex flex-col flex-wrap border-r-2">
                <div class="px-5 text-xl my-4">
                    Files Frames
                </div>
                @code
                    let index = 0;
                    const codesParsed = JSON.stringify($codes);
                @endcode

                <ol>
                @for(const stack of $stacks)
                    <li>
                        <a href="#" class="border-b-2 files-error box-border flex flex-col py-3 px-5 bg-slate-100 {{ index === 0 ? 'bg-red-400 hover:bg-red-500 text-white' : 'hover:bg-slate-300' }}" data-selected="{{ index === 0 ? true : false }}" data-index="{{ index }}" data-line="{{ stack.code.error ? stack.code.error[0] : 1 }}">
                            <span>{{ stack.info.path.system }}{{ stack.code.error ? " : " + stack.code.error[0] : undefined }}</span>
                            <b>
                                {{ stack.code.execute.action }}
                            </b>
                        </a>
                    </li>
                    @code
                        index++
                    @endcode
                @endfor
                </ol>
            </div>
            <div class="mr-5">
                <div id="mini-code-title" class="my-4"></div>
                <div id="mini-code" class="max-w-[900px] min-h-[504px] max-h-[504px] box-border duration-300 overflow-hidden hover:overflow-auto m-0 p-0"></div>
            </div>
        </div>
    </div>

    <script>
        const filesError = document.querySelectorAll('.files-error');
        const codes = {{ codesParsed }};
        const initLine = {{ $stacks[0].code.error ? $stacks[0].code.error[0] : 1 }}

        loadCode(0, initLine);

        filesError.forEach(file => {
            file.addEventListener('click', e => {
                e.preventDefault();

                filesError.forEach(file => {
                    const selected = Boolean(file.getAttribute('data-selected'));

                    if (selected) {
                        file.classList.remove('bg-red-400', 'text-white', 'hover:bg-red-500');
                        file.classList.add("hover:bg-slate-300");
                        file.setAttribute('data-selected', 'false');
                    }
                });

                file.classList.add('bg-red-400', 'text-white', 'hover:bg-red-500');
                file.classList.remove("hover:bg-slate-300");
                file.setAttribute('data-selected', 'true');
                loadCode(Number(file.getAttribute('data-index')), Number(file.getAttribute('data-line')));
                focusLine(Number(file.getAttribute('data-line')));
            });
        });

        function loadCode(index, line) {
            const miniCode = document.querySelector('#mini-code');
            const miniCodeTitle = document.querySelector('#mini-code-title');
            const tableCode = document.createElement('table');
            const tbody = document.createElement('tbody');

            miniCode.innerHTML = '';
            miniCodeTitle.innerHTML = '';

            tableCode.classList.add('table-fixed');

            const { code, path } = codes[index];

            miniCodeTitle.innerText = path + " : " + line;
            miniCodeTitle.classList.add('font-bold', 'text-lg', 'text-right');

            for (const c of code) {
                const tr = document.createElement('tr');

                const codeLine = document.createElement('pre');
                const tdCodeLine = document.createElement('td');
                const tdCodeLineNumber = document.createElement('td');

                tr.id = "line-"+String(c.line);
                tr.classList.add("w-full")

                tdCodeLineNumber.width = "5%";
                tdCodeLineNumber.innerText = c.line
                tdCodeLineNumber.classList.add('bg-gray-200', 'text-gray-700', 'text-right', 'py-2', 'px-1', 'text-sm', "select-none");
                codeLine.classList.add('text-gray-700', 'text-sm', 'pl-3');

                if (c.line === line) {
                    tdCodeLineNumber.classList.remove('text-gray-700', "bg-gray-200");
                    tdCodeLineNumber.classList.add('bg-red-500', 'text-white');
                    tr.classList.add('bg-red-200');
                }

                codeLine.textContent = c.code;

                tdCodeLine.appendChild(codeLine);
                tdCodeLine.width = "95%";
                tdCodeLine.classList.add("whitespace-nowrap", "select-none")

                tr.appendChild(tdCodeLineNumber);
                tr.appendChild(tdCodeLine);

                tbody.appendChild(tr);
            }

            tableCode.appendChild(tbody);

            miniCode.appendChild(tableCode);
        }

        function focusLine(line) {
            const tr = document.querySelector("#line-"+line);

            if (tr) {
                tr.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center'
                });
            }
        }

        focusLine(initLine);
    </script>
</body>

</html>
`;

export default TEMPLATE;
