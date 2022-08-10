// deno-lint-ignore-file no-inferrable-types
import { HttpFile } from './http-file.ts';
import { Fs } from '../../dependencies.ts';
import { storage } from '../../helpers/miscellaneous.ts'

const { moveSync } = Fs;

export class HttpUploadedFile extends HttpFile{
    public constructor(content: Uint8Array | undefined, originalName: string, size: number, type: string, tmp: string | undefined, filename: string | undefined) {
        super(content, originalName, size, type, tmp, filename, undefined);
    }

    public move (path: string, name?: string): void {
        if (name) {
            moveSync(`${this.tmp}${this.fileName}`, `${path}${name}`);
        } else {
            moveSync(`${this.tmp}${this.fileName}`, `${path}${this.originalName}`);
        }
    }

    public async save (path: string): Promise<void> {
        const content = await this.getContent();

        if (content) await Deno.writeFile(`${path}${this.originalName}`, content);
    }

    public async saveAs (path: string, name: string): Promise<void> {
        const content = await this.getContent();

        if (content) await Deno.writeFile(`${path}${name}`, content);
    }

    public async store (path: string, disk: string = 'public'): Promise<void> {
        const content = await this.getContent();

        if (content) storage().disk(disk).put(`${path}${this.originalName}`, content);
    }

    public async storeAs (path: string, name: string, disk: string = 'public'): Promise<void> {
        const content = await this.getContent();

        if (content) storage().disk(disk).put(`${path}${name}`, content);
    }
}
