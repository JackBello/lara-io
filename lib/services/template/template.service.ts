// deno-lint-ignore-file no-explicit-any
import { Service } from '../services.ts';

import { history } from '../../helpers/index.ts';

export class TemplateService extends Service {
    public render(template: string, data: any): string {
        const aliases = {
            'history': history()
        }

        return this.compile(template)(data, aliases);
    }

    protected parse(template: string): string[] {
        const results = [];

        let regExpVar = /{{(.*?)}}/g.exec(template);
        // let regExpFor = /(\$for\((.*?)\)|\$endfor)/g.exec(template);
        // let regExpIf = /\$if\((.*?)\)\$endif/g.exec(template);
        // let regExpElse = /\$else\((.*?)\)\$endelse/g.exec(template);
        let index;

        while(regExpVar) {
            index = regExpVar.index;

            if (index !== 0) {
                results.push(template.slice(0, index));
                template = template.slice(index);
            }

            results.push(regExpVar[0]);
            template = template.slice(regExpVar[0].length);
            regExpVar = /({{(.*?)}}|\$[a-zA-Z])/g.exec(template);
        }

        if (template) results.push(template);

        return results;
    }

    protected convert(results: string[]): string {
        let template = ``;
        let params;

        results.map(parts => {
            if (parts.startsWith('$for') && parts.endsWith('$endfor')) {
                console.log(parts);
            }

            if (parts.startsWith("{{") && parts.endsWith("}}")) {
                params = parts.split(/{{|}}/).filter(Boolean)[0].trim();

                if (params.search(/\(\)/) !== -1) {
                    template += "${aliases."+params.replace(/\(\)/, '')+"}";
                } else {
                    template += "${data."+params+"}";
                }
                
            } else {
                template += parts;
            }
        });

        template = `\`${template}\``;

        return template;
    }

    protected compile(template: string) {
        return new Function(`data`, `aliases`, `return ` + this.convert(this.parse(template)));
    }
}