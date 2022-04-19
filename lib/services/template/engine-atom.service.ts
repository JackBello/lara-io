// deno-lint-ignore-file
import { Service } from '../services.ts';

export class EngineAtom extends Service {
    private regExp = /({{(.*?)}}|\<\{(.*?)\}\>|\@for\((.*?)\)|\@endfor|\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|\@break|\@continue|\@while\((.*?)\)|\@do|\@endwhile)/g;
    private code = "const result = [];\n";
    private js = false;

    protected convert(line: string) {
        let vars: string
        if (line.match(this.regExp)) {
            if (line.match(/(\@break|\@continue)/g)) {
                this.code += line.slice(1) + ";\n";
            }

            if (line.match(/(\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|[\w\d\s\S]+)/g)) {
                if (line.match(/\@if\((.*?)\)/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g, "context.")
                        .replace(/\)/g, "){");
                }

                if (line.match(/\@elseif\((.*?)\)/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g, "context.")
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
                        .replace("do", "do {");
                } 
                if (line.match(/\@while\((.*?)\)/g)) {
                    this.code += line.slice(1)
                        .replace(/\$/g,  "context.")
                        .replace(/\)/g, "){");
                }
                if (line.match(/\@endwhile/g)) {
                    this.code += "}";
                }
            }

            if (line.match(/\<\{(.*?)\}\>/g)) {
                this.code += '/*' + line.split(/\<\{|\}\>/).filter(Boolean)[0].trim() + "*/";
            }

            else if (line.match(/{{(.*?)}}/g)) {
                vars = line.split(/{{(.*?)}}/).filter(Boolean)[0].trim();
                if (vars.startsWith("$")) {
                    this.code += 'result.push(' + vars.replace(/\$/g, "context.") + ');';
                } else if (vars.match(/(app\(\)|history\(\)|request\(\))/g)){
                    this.code += 'result.push(' + "helpers." + vars + ');';
                } else if (vars.match(/(App|History|Request)/g)) {
                    this.code += 'result.push(' + "fecades." + vars + ');';
                } else {
                    this.code += 'result.push(' + vars + ');';
                }
            }
        }
        else {
            if (!this.js) {
                if (line.match(/\@code/g)) this.js = true;
            }

            if (this.js) {
                this.code += line
                    .replace(/\$/g, "context.")
                    .replace(/\@code|\@endcode/g, "");

                if (line.match(/\@endcode/g)) this.js = false;
            } else { 
                this.code += 'result.push(`' + line + '`);\n';
            }
        }
    }

    protected parser(text: string) {
        let regExp = /({{(.*?)}}|\<\{(.*?)\}\>|\@code|\@endcode|\@for\((.*?)\)|\@endfor|\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|\@break|\@continue|\@while\((.*?)\)|\@do|\@endwhile)/g.exec(text);

        let index;

        while(regExp) {
            index = regExp.index;

            if (index !== 0) {
                this.convert(text.slice(0, index));
                text = text.slice(index);
            }

            this.convert(regExp[0]);
            text = text.slice(regExp[0].length);
            regExp = /({{(.*?)}}|\<\{(.*?)\}\>|\@code|\@endcode|\@for\((.*?)\)|\@endfor|\@if\((.*?)\)|\@elseif\((.*?)\)|\@else|\@endif|\@break|\@continue|\@while\((.*?)\)|\@do|\@endwhile)/g.exec(text);
        }

        if (text) this.convert(text);

        this.code = this.code + 'return result.join("");';
    }

    public compile(template: string) {
        this.parser(template);

        const exec = new Function(`context`, `fecades`, `helpers`, this.code);

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

@do

@includes()

@extends()

@auth()

@env()

@csrf()

@session()
*/