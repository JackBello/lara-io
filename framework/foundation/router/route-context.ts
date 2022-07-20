// deno-lint-ignore-file no-explicit-any
export class RouteContext {
    protected context: any = {};

    public inject(name: string, value: any): void {
        this.context[name] = value;
    }

    public clear() {
        this.context = {};
    }

    public getContext() {
        return this.context;
    }
}
