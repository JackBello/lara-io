import HttpFile from './http-file.ts';
import { Fs } from '../../dependencies.ts';

const { moveSync } = Fs;

export class HttpUploadedFile extends HttpFile{
    public constructor(content: Uint8Array | undefined, originalName: string, size: number, type: string, tmp: string | undefined, filename: string | undefined) {
        super(content, originalName, size, type, tmp, filename);
    }

    public move (path: string, name?: string): void {
        if (name) {
            moveSync(`${this.tmp}${this.fileName}`, `${path}${name}`);
        } else {
            moveSync(`${this.tmp}${this.fileName}`, `${path}${this.originalName}`);
        }
    }

    public save (path: string): void {
        const content = this.getContent();

        if (content) Deno.writeFileSync(`${path}${this.originalName}`, content);
    }

    public saveAs (path: string, name: string): void {
        const content = this.getContent();

        if (content) Deno.writeFileSync(`${path}${name}`, content);
    }

    // public store (path: string, disk: string = 'public'): void {

    // }

    // public storeAs (path: string, name: string, disk: string = 'public'): void {

    // }
}
