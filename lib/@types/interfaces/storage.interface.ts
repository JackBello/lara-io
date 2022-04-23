export interface ILinks {
  path_old: string;
  path_new: string;
}

interface IDisk {
  driver: string;
  root: string;
}

interface IDisks {
  [key: string]: IDisk;
}

export interface IStorage {
  disks: IDisks;
  links: ILinks[];
}
