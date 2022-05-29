// deno-lint-ignore-file no-explicit-any
export default class FecadeContainer {
    protected static _instance: FecadeContainer;

    protected _FecadeInstaces_: Map<string, any> = new Map();

    public hasFecade(name: string): boolean {
        return this._FecadeInstaces_.has(name);
    }

    public deleteFecade(name: string): void {
        this.noExistFecade(name);

        this._FecadeInstaces_.delete(name);
    }

    public clearFecades(): void {
        this._FecadeInstaces_.clear();
    }

    protected existFecade(name: string): void {
        if(this.hasFecade(name)) throw new Error(`this facade ${name} already exist`);
    }

    protected noExistFecade(name: string): void {
        if(!this.hasFecade(name)) throw new Error(`this facade ${name} not exist`);
    }

    public setFecade(name: string, bind: any): void {
        this.existFecade(name);

        this._FecadeInstaces_.set(name, bind);
    }

    public getFecade(name: string) {
        this.noExistFecade(name);

        return this._FecadeInstaces_.get(name);
    }

    public replaceFecade(name: string, bind: any): void {
        this.noExistFecade(name);

        this._FecadeInstaces_.set(name, bind);
    }
}