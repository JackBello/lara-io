// deno-lint-ignore-file no-explicit-any
import FecadeContainer from './fecade.container.ts';

import Binding from './binding.ts';

export class Container {
    protected static _instance: Container;

    protected _instances: Map<string, any> = new Map();
    protected _bindings: Map<string, any> = new Map();
    protected _aliases: Map<string, any> = new Map();
    protected _fecades: FecadeContainer = new FecadeContainer();

    public get fecade() {
        return this._fecades;
    }

    public static get instance() {
        if(this._instance === null) {
            this._instance = new this();
        }

        return this._instance;
    }

    public static set instance(instance: Container) {
        this._instance = instance;
    }

    public has(abstract: string){
        return this._bindings.has(abstract);
    }

    public bind(abstract: string, callback: any, shared = false){
        this.register(abstract, callback, shared, true);
    }

    public bindInstance(abstract: string, instance: any, shared = false) {
        this.register(abstract, instance, shared, false);
    }

    protected bound(abstract: string){
        return this._bindings.has(abstract) || this._instances.has(abstract) || this._aliases.has(abstract);
    }

    public alias(abstract: string, alias: string){
        if( ! this.bound(abstract)){
            throw new Error('Cannot assign alias for abstract "' + abstract + '". Abstract has no binding.');
        }

        this._aliases.set(alias, abstract);
    }

    public singleton(abstract: string, callback: any){
        this.bind(abstract, callback, true);
    }

    public singletonInstance(abstract: string, instance: any) {
        this.bindInstance(abstract, instance, true)
    }

    public make(abstract: string, parameters: any){
        const getAbstract = this.getAbstract(abstract);

        if(this._instances.has(getAbstract)){
            return this._instances.get(getAbstract);
        }

        const binding = this.getBinding(abstract);

        const object = this.build(binding, parameters);

        if(binding.shared){
            this._instances.set(getAbstract, object);
        }

        return object;
    }

    protected build(concrete: any, parameters: any){
        if (concrete instanceof Binding && concrete.isCallback)
            return concrete.concrete(this, parameters);

        if (concrete instanceof Binding)
            concrete = concrete.concrete;

        if (typeof concrete === "object")
            return concrete;

        if (concrete === null)
            return concrete;

        if (!Array.isArray(parameters))
            parameters = Object.keys(parameters).map((key: string) => parameters[key]);

        return new concrete(...parameters);
    }

    protected getAbstract(alias: string){
        if(!this._aliases.has(alias)){
            return alias;
        }

        return this._aliases.get(alias);
    }

    protected getBinding(abstract: string){
        if(!this._bindings.has(abstract)){
            throw new Error('No binding found for abstract "' + abstract + '"');
        }

        return this._bindings.get(abstract);
    }

    public forget(abstractOrInstance: string){
        this._bindings.delete(abstractOrInstance);
        this._aliases.delete(abstractOrInstance);
        this._instances.delete(abstractOrInstance);
    }

    public flush(){
        this._bindings.clear();
        this._aliases.clear();
        this._instances.clear();
    }

    protected register(abstract: string, concretate: any, shared = false, isConcreteCallback = true) {
        const binding = new Binding(abstract, concretate, shared, isConcreteCallback);

        this._bindings.set(binding.abstract, binding);
    }
}
