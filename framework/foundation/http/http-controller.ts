// deno-lint-ignore-file no-explicit-any
import { TMiddleware } from '../../@types/route.ts';

export class HttpController {
    [index: string]: any;

    protected __middlewares: any[] = [];
    protected __applied: Record<string, string[]> = {
        "only": [],
        "except": []
    }

    private apply(type: string, method: string | string[]) {
        if (typeof method === "string") {
            this.__applied[type].push(method);
        } else if (Array.isArray(method)) {
            this.__applied[type] = method;
        }
    }

    protected middleware(middlewares: TMiddleware) {
        if (typeof middlewares === "string" || typeof middlewares === "function") {
            this.__middlewares.push(middlewares);
        } else if (Array.isArray(middlewares)) {
            this.__middlewares.push(...middlewares);
        }

        return {
            only: (method: string | string[]) => {
                this.apply("only", method);
            },
            except: (method: string | string[]) => {
                this.apply("except", method);
            }
        }
    }

    public getMiddlewares() {
        return this.__middlewares;
    }

    public getApplied() {
        return this.__applied;
    }
}
