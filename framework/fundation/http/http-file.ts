export default class HttpFile {
    private __content: Uint8Array | undefined;
    private __originalName: string;
    private __filename: string | undefined;
    private __size: number;
    private __type: string;
    private __tmp: string | undefined;

    public constructor(content: Uint8Array | undefined, originalName: string, size: number, type: string, tmp: string | undefined, filename: string | undefined) {
        this.__content = content;
        this.__originalName = originalName;
        this.__filename = filename;
        this.__size = size;
        this.__type = type;
        this.__tmp = tmp;
    }

    public static fake() {

    }

    private getFileName() {
        return this.__filename;
    }

    private getOriginalName() {
        return this.__originalName;
    }

    private getSize() {
        return this.__size;
    }

    private getType() {
        return this.__type.split("/")[0];
    }

    private getTmp() {
        return this.__tmp;
    }

    private getExtension() {
        return this.__type.split("/")[1];
    }

    private getMimeType() {
        return this.__type;
    }

    public getContent(): Uint8Array {
        if (this.__content) return this.__content;
        return Deno.readFileSync(`${this.tmp}${this.fileName}`);
    }

    get originalName(): string {
        return this.getOriginalName();
    }

    get fileName(): string | undefined {
        return this.getFileName();
    }

    get size(): number {
        return this.getSize();
    }

    get type(): string {
        return this.getType();
    }

    get tmp(): string | undefined {
        return this.getTmp();
    }

    get extension(): string {
        return this.getExtension();
    }

    get mimeType(): string {
        return this.getMimeType();
    }
}
