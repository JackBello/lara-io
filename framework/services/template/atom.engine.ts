// deno-lint-ignore-file

export class EngineAtom {
    private regExpCodeJS = /({{(.*?)}}|{{--(.*?)--}}|\@for\((.*?)\)|\@endfor|\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|\@break|\@continue|\@while\((.*?)\)|\@do|\@endwhile)/g;
    private regExpDirectives = /\@(.*?)\((.*?)\)/g;
    private code = "const result = [];\n";
    private isJS = false;
    private isDoWhile = false;
    private matchHelpers = /(app|service|config|history|request|appPath|configPath|databasePath|ecosystemPath|publicPath|resourcePath|routerPath|storagePath|^css|^script)/g;
    private matchFecades = /(App|History|Request)/g;

    public registerDirective(name: string, func: Function) {
    }

    public share(object: any) {
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                this.code = this.code + `const ${key} = ${this.parseVariables(object[key])};\n`;
            }
        }
    }

    protected parseVariables(vars: any) {
        if (typeof vars === "string") {
            return `"${vars}"`;
        } else if (typeof vars === "number") {
            return vars;
        } else if (typeof vars === "boolean") {
            return vars;
        } else if (typeof vars === "object") {
            return JSON.stringify(vars);
        } else if (typeof vars === "function") {
            return `${vars}`;
        } else {
            return vars;
        }
    }

    protected convert(line: string) {
        let vars: string
        if (line.match(this.regExpCodeJS)) {
            if (line.match(/(\@break|\@continue)/g)) {
                this.code += line.slice(1) + ";\n";
            }

            if (line.match(/(\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|[\w\d\s\S]+)/g)) {
                if (line.match(/\@if\((.*?)\)/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g, "context.")
                        .replace(/\#/g, "global.")
                        .replace(/\)/g, "){");
                }

                if (line.match(/\@elseif\((.*?)\)/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g, "context.")
                        .replace(/\#/g, "global.")
                        .replace("elseif", "} else if")
                        .replace(/\)/g, "){");
                }

                else if (line.match(/\@else/g)) {
                    this.code += line.slice(1).replace("else", "} else {");
                }

                if (line.match(/\@endif/g)) {
                    this.code += line.slice(1).replace("endif", "}");
                }
            }

            if (line.match(/(\@for\((.*?)\)|\@endfor|[\w\d\s\S]+)/g)) {
                if (line.match(/\@for\((.*?)\)/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g, "context.")
                        .replace(/\#/g, "global.")
                        .replace(/\)/g, "){");
                }
                if (line.match(/\@endfor/g)) {
                    this.code += "}";
                }
            }

            if (line.match(/(\@while\((.*?)\)|\@do|\@endwhile|[\w\d\s\S]+)/g)) {
                if (line.match(/\@do/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g, "context.")
                        .replace(/\#/g, "global.")
                        .replace("do", "do {");
                }
                if (line.match(/\@while\((.*?)\)/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g,  "context.")
                        .replace(/\#/g, "global.")
                        .replace(/\)/g, "){");
                }
                if (line.match(/\@endwhile/g)) {
                    this.code += "}";
                }
            }

            if (line.match(/{{--(.*?)--}}/g)) {
                this.code += '/*' + line.split(/{{--(.*?)--}}/).filter(Boolean)[0].trim() + "*/";
            }

            else if (line.match(/{{(.*?)}}/g)) {
                vars = line.split(/{{(.*?)}}/).filter(Boolean)[0].trim();
                if (vars.startsWith("$")) {
                    this.code += 'result.push(' + vars.replace(/\$/g, "context.") + ');';
                } else if (vars.startsWith("#")) {
                    this.code += 'result.push(' + vars.replace(/\#/g, "global.") + ');';
                } else if (vars.match(this.matchHelpers)){
                    this.code += 'result.push(' + "helpers." + vars + ');';
                } else if (vars.match(this.matchFecades)) {
                    this.code += 'result.push(' + "fecades." + vars + ');';
                } else {
                    this.code += 'result.push(' + vars + ');';
                }
            }
        }
        else {
            if (!this.isJS) {
                if (line.match(/\@code/g)) this.isJS = true;
            }

            if (this.isJS) {
                this.code += line
                    .replace(/\$/g, "context.")
                    .replace(/\#/g, "global.")
                    .replace(/\@code|\@endcode/g, "");

                if (line.match(/\@endcode/g)) this.isJS = false;
            } else {
                this.code += 'result.push(`' + line + '`);\n';
            }
        }
    }

    protected parser(text: string) {
        let regExp = /({{(.*?)}}|{{--(.*?)--}}|\@code|\@endcode|\@for\((.*?)\)|\@endfor|\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|\@break|\@continue|\@while\((.*?)\)|\@do|\@endwhile)/g.exec(text);

        let index;

        while(regExp) {
            index = regExp.index;

            if (index !== 0) {
                this.convert(text.slice(0, index));
                text = text.slice(index);
            }

            this.convert(regExp[0]);
            text = text.slice(regExp[0].length);
            regExp = /({{(.*?)}}|{{--(.*?)--}}|\@code|\@endcode|\@for\((.*?)\)|\@endfor|\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|\@break|\@continue|\@while\((.*?)\)|\@do|\@endwhile)/g.exec(text);
        }

        if (text) this.convert(text);

        this.code = this.code + 'return result.join("");';
    }

    public compile(template: string): Promise<any> {
        this.parser(template);

        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

        const exec = new AsyncFunction(`context`, `fecades`, `helpers`, `global`, `shared`, this.code);

        this.code = "const result = [];\n";

        return exec;
    }
}

/*
/Directivas
@switch()
@case()
@default()
@endswitch;
@with()
@endwith;
@do;

@function(name, params)

@endfunction;

@excapehtml()
@includes()
@extends()
@component()
@auth()
@env()
@csrf()
@session()
@route()
*/
