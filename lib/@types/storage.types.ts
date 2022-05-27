import { IDisk, IInfoFile } from "./storage.interface.ts";
import { TUploadedFile } from './request.ts';

export type TStorage = {
  // storage_path: (path?: string) => string;
  // public_path: (path?: string) => string;
  exists: (path: string) => boolean;
  missing: (path: string) => boolean;
  get: (path: string) => string;
  put: (path: string, contents: Uint8Array) => boolean;
  putFile: (path: string, contents: TUploadedFile) => string
  putFileAs: (path: string, contents: TUploadedFile, name: string) => string
  delete: (path: string | Array<string>) => boolean
  path: (path: string) => string;
  url: (path: string) => string;
  info: (path: string) => IInfoFile;
  name: (path: string) => string;
  baseName: (path: string) => string;
  dirName: (path: string) => string;
  extension: (path: string) => string;
  fileInfo(path: string): Deno.FileInfo;
  size(path: string): number;
  lastModified(path: string): Date | null;
  lasAccessed(path: string): Date | null;
  creationDate(path: string): Date | null;
  isDirectory(path: string): boolean;
  isFile(path: string): boolean;
  isSymlink(path: string): boolean;
  disk: (name?: string | null) => TStorage;
};
