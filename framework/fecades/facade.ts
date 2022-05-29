// deno-lint-ignore-file
import { Container } from '../container/container.ts';

export class Fecade {
    protected static __container?: Container;

    protected _fecadeAccessor?: string;
    protected _facadeRoot?: any;

    constructor(accessor: string){
        if(new.target === Fecade){
            throw new TypeError('Cannot create Facade instance, class is abstract');
        }

        this.facadeAccessor = accessor;

        return new Proxy(this, Fecade.makeFacadeProxy());
    }

    protected set facadeAccessor(accessor: string){
        this._fecadeAccessor = accessor;
    }

    protected get facadeAccessor(){
        if(this._fecadeAccessor === undefined){
            throw new Error("facade accessor undefined");
        }

        return this._fecadeAccessor;
    }

    get facadeRoot(){
        if(this._facadeRoot == undefined){
            this._facadeRoot = Fecade.resolveFacadeInstance(this.facadeAccessor);
        }

        return this._facadeRoot;
    }

    static set container(container: Container){
        this.__container = container;
    }

    static get container(){
        if (this.__container === undefined) {
            throw new Error("container undefined");
        }
        return this.__container;
    }

    static resolveFacadeInstance(name: string){
        if(Fecade.hasResolvedInstance(name)) return this.__container?.fecade.getFecade(name);

        let resolvedInstance;

        if (name === "app") {
            resolvedInstance = Fecade.container.make(`@${name}`, {});
        } else if (name.startsWith("@/")) {
            resolvedInstance = Fecade.container.make(`${name}`, {});
        } else {
            resolvedInstance = Fecade.container.make(`@service/${name}`, {});
        }

        this.__container?.fecade.setFecade(name, resolvedInstance);

        return resolvedInstance;
    }

    static hasResolvedInstance(name: string) {
        return this.__container?.fecade.hasFecade(name);
    }

    static clearResolvedInstance(name: string){
        this.__container?.fecade.deleteFecade(name);
    }

    static clearResolvedInstances(){
        this.__container?.fecade.clearFecades();
    }

    static makeFacadeProxy(){
        return {
            set : function(facade: any, property: any, value: any){
                if (property in facade && property != 'name') return facade[property] = value;

                const facadeRoot = facade.facadeRoot;

                return facadeRoot[property] = value;
            },

            get: function(facade: any, property: any) {
                if (property in facade && property != 'name') return facade[property];

                const facadeRoot = facade.facadeRoot;

                return facadeRoot[property];
            },
        };
    }
}
