// deno-lint-ignore-file no-explicit-any
import { Service } from '../services.ts';

type Next = () => Promise<void> | void

type Middleware = (context: any, next: Next) => Promise<void> | void

export class RouterMiddlewareService extends Service {
    private stack: any[] = [];

    private _result_: any;
    private _context_: any;
    private _action_: any;

    get result() {
        return this._result_;
    }

    set result(value: any) {
        this._result_ = value;
    }
    
    public setContext(context: any) {
        this._context_ = context;
    }

    public setAction(action: any) {
        this._action_ = action;
    }

    public add(middleware: any) {
        if (typeof middleware === "string") {
            //
        } else if (typeof middleware === "function") {
            this.stack.push(middleware);
        } else if (Array.isArray(middleware)) {
            //
        }
    }

    public async run() {
        this.result = undefined;

        await this.execute(0);
    }

    public async execute(index: number) {
        let previusIndex = -1;

        if (index === previusIndex) {
            throw new Error('next() called multiple times');
        }

        const middleware = this.stack[index];
        let action;

        if (middleware) {
            action = await middleware(this._context_, async () => {
                previusIndex = index;

                return await this.execute(index + 1);
            });

            if (action) {
                this.result = action;
            }
        } else {
            action = this._action_;

            if (action) {
                this.result = action;

                previusIndex = -1;
                this.stack = [];
            }
        }
    }
}