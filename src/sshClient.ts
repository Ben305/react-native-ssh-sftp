import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  DeviceEventEmitter,
  EmitterSubscription
} from 'react-native';

const { RNSSHClient } = NativeModules;

import { PasswordOrKey } from './interfaces/passwordOrKey';
import { FileListEntry } from './interfaces/fileListEntry';

export class SSHClient {
  private _key: string;
  private handlers: any;
  private host: string;
  private port: number;
  private username: string;
  private passwordOrKey: string | any;
  private shellListener: EmitterSubscription | null;
  private downloadProgressListener: EmitterSubscription | null;
  private uploadProgressListener: EmitterSubscription | null;
  private rnSSHClientEmitter: NativeEventEmitter;

  constructor(
    host: string,
    port: number,
    username: string,
    passwordOrKey: string | PasswordOrKey,
    callback: (error: Error) => void
  ) {
    this.shellListener = null;
    this.downloadProgressListener = null;
    this.uploadProgressListener = null;
    this.rnSSHClientEmitter = new NativeEventEmitter(RNSSHClient);

    this._key = Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    this.handlers = {};
    this.host = host;
    this.port = port;
    this.username = username;
    this.passwordOrKey = passwordOrKey;
    this.connect(callback);
  }

  _handleEvent(event: { name: string; key: string; value: any }) {
    if (this.handlers.hasOwnProperty(event.name) && this._key === event.key) {
      this.handlers[event.name](event.value);
    }
  }

  on(event: any, handler: any) {
    this.handlers[event] = handler;
  }

  connect(callback: (error: Error) => void) {
    if (Platform.OS === 'android') {
      if (typeof this.passwordOrKey === 'string')
        RNSSHClient.connectToHostByPassword(
          this.host,
          this.port,
          this.username,
          this.passwordOrKey,
          this._key,
          (error: Error) => {
            callback && callback(error);
          }
        );
      else
        RNSSHClient.connectToHostByKey(
          this.host,
          this.port,
          this.username,
          this.passwordOrKey,
          this._key,
          (error: Error) => {
            callback && callback(error);
          }
        );
    } else {
      RNSSHClient.connectToHost(
        this.host,
        this.port,
        this.username,
        this.passwordOrKey,
        this._key,
        (error: Error) => {
          callback && callback(error);
        }
      );
    }
  }

  execute(command: string, callback: (error: Error, response: any) => void) {
    RNSSHClient.execute(command, this._key, (error: Error, response: any) => {
      callback && callback(error, response);
    });
  }

  startShell(
    ptyType: 'vanilla' | 'vt100' | 'vt102' | 'vt220' | 'ansi' | 'xterm',
    callback: (error: Error) => void
  ) {
    if (Platform.OS === 'ios') {
      this.shellListener = this.rnSSHClientEmitter.addListener('Shell', this._handleEvent.bind(this));
    } else {
      this.shellListener = DeviceEventEmitter.addListener('Shell', this._handleEvent.bind(this));
    }
    RNSSHClient.startShell(this._key, ptyType, (error: Error) => {
      callback && callback(error);
    });
  }

  writeToShell(command: string, callback: (error: Error) => void) {
    RNSSHClient.writeToShell(command, this._key, (error: Error) => {
      callback && callback(error);
    });
  }

  closeShell() {
    if (this.shellListener) {
      this.shellListener.remove();
      this.shellListener = null;
    }
    RNSSHClient.closeShell(this._key);
  }

  connectSFTP(callback: (error: Error) => void) {
    RNSSHClient.connectSFTP(this._key, (error: Error) => {
      callback && callback(error);
      if (Platform.OS === 'ios') {
        this.downloadProgressListener = this.rnSSHClientEmitter.addListener(
          'DownloadProgress',
          this._handleEvent.bind(this)
        );
        this.uploadProgressListener = this.rnSSHClientEmitter.addListener(
          'UploadProgress',
          this._handleEvent.bind(this)
        );
      } else {
        this.downloadProgressListener = DeviceEventEmitter.addListener(
          'DownloadProgress',
          this._handleEvent.bind(this)
        );
        this.uploadProgressListener = DeviceEventEmitter.addListener(
          'UploadProgress',
          this._handleEvent.bind(this)
        );
      }
    });
  }

  sftpLs(path: string, callback: (error: Error, response: FileListEntry[]) => void) {
    RNSSHClient.sftpLs(path, this._key, (error: Error, response: FileListEntry[]) => {
      callback && callback(error, response);
    });
  }

  sftpRename(oldPath: string, newPath: string, callback: (error: Error) => void) {
    RNSSHClient.sftpRename(oldPath, newPath, this._key, (error: Error) => {
      callback && callback(error);
    });
  }

  sftpMkdir(path: string, callback: (error: Error) => void) {
    RNSSHClient.sftpMkdir(path, this._key, (error: Error) => {
      callback && callback(error);
    });
  }

  sftpRm(path: string, callback: (error: Error) => void) {
    RNSSHClient.sftpRm(path, this._key, (error: Error) => {
      callback && callback(error);
    });
  }

  sftpRmdir(path: string, callback: (error: Error) => void) {
    RNSSHClient.sftpRmdir(path, this._key, (error: Error) => {
      callback && callback(error);
    });
  }

  sftpUpload(filePath: string, path: string, callback: (error: Error) => void) {
    RNSSHClient.sftpUpload(filePath, path, this._key, (error: Error) => {
      callback && callback(error);
    });
  }

  sftpCancelUpload() {
    RNSSHClient.sftpCancelUpload(this._key);
  }

  sftpDownload(path: string, toPath: string, callback: (error: Error, filePath: string) => void) {
    RNSSHClient.sftpDownload(path, toPath, this._key, (error: Error, filePath: string) => {
      callback && callback(error, filePath);
    });
  }

  sftpCancelDownload() {
    RNSSHClient.sftpCancelDownload(this._key);
  }

  disconnectSFTP() {
    if (this.downloadProgressListener) {
      this.downloadProgressListener.remove();
      this.downloadProgressListener = null;
    }
    if (this.uploadProgressListener) {
      this.uploadProgressListener.remove();
      this.uploadProgressListener = null;
    }
    RNSSHClient.disconnectSFTP(this._key);
  }

  disconnect() {
    if (this.shellListener) this.shellListener.remove();
    if (this.downloadProgressListener) this.downloadProgressListener.remove();
    if (this.uploadProgressListener) this.uploadProgressListener.remove();
    RNSSHClient.disconnect(this._key);
  }
}
