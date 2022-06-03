export interface ILinks {
  path_old: string;
  path_new: string;
}

export interface IDisk {
  driver: string;
  root: string;
  url?: string;
}

export interface IDisks {
  [key: string]: IDisk;
}

export interface IStorage {
  disks: IDisks;
  links: ILinks[];
  default: string;
}

export interface IInfoFile {
  root: string;
  dir: string;
  base: string;
  ext: string;
  name: string;
}
