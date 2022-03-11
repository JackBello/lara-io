export interface IConfig {
    name: string;
    ref: string;
    type: string | "provider" | "service";
    [key:string]: any;
}