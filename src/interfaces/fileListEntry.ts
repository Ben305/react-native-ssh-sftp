export interface FileListEntry {
    filename: string;
    isDirectory: boolean;
    modificationDate: Date;
    lastAccess: Date;
    fileSize: number;
    ownerUserID: number;
    ownerGroupID: number;
    permissions: string;
    flags: number;
  }