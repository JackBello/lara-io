// deno-lint-ignore-file no-explicit-any
export default class Binding {
    public abstract: string;
    public concrete: any;
    public shared: boolean;
    public isCallback: boolean;

    constructor(abstract: string, concrete: any, shared = false, isConcreteCallback = true) {
        this.abstract = abstract;
        this.shared = shared;
        this.isCallback = isConcreteCallback;
        this.concrete = concrete;
    }
}