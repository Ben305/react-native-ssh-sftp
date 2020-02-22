import { PasswordOrKey } from './interfaces/passwordOrKey';
import { FileListEntry } from './interfaces/fileListEntry';
export declare class SSHClient {
    private _key;
    private handlers;
    private host;
    private port;
    private username;
    private passwordOrKey;
    private shellListener;
    private downloadProgressListener;
    private uploadProgressListener;
    private rnSSHClientEmitter;
    constructor(host: string, port: number, username: string, passwordOrKey: string | PasswordOrKey, callback: (error: Error) => void);
    _handleEvent(event: {
        name: string;
        key: string;
        value: any;
    }): void;
    on(event: any, handler: any): void;
    connect(callback: (error: Error) => void): void;
    execute(command: string, callback: (error: Error, response: any) => void): void;
    startShell(ptyType: 'vanilla' | 'vt100' | 'vt102' | 'vt220' | 'ansi' | 'xterm', callback: (error: Error) => void): void;
    writeToShell(command: string, callback: (error: Error) => void): void;
    closeShell(): void;
    connectSFTP(callback: (error: Error) => void): void;
    sftpLs(path: string, callback: (error: Error, response: FileListEntry[]) => void): void;
    sftpRename(oldPath: string, newPath: string, callback: (error: Error) => void): void;
    sftpMkdir(path: string, callback: (error: Error) => void): void;
    sftpRm(path: string, callback: (error: Error) => void): void;
    sftpRmdir(path: string, callback: (error: Error) => void): void;
    sftpUpload(filePath: string, path: string, callback: (error: Error) => void): void;
    sftpCancelUpload(): void;
    sftpDownload(path: string, toPath: string, callback: (error: Error, filePath: string) => void): void;
    sftpCancelDownload(): void;
    disconnectSFTP(): void;
    disconnect(): void;
}
