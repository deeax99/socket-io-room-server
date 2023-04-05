import { io, Socket } from 'socket.io-client';
import { Awaiter, GenericAwaiter } from '../../../../src/util/awaiter';
import ServerOperationResult from '../../../../src/socket-io-room-server/dto/server-operation-result';
import { OldObservable } from '../../../../src/util/observable';
import { KeyValueDataChange } from '../../../../src/socket-io-room-server/dto/data-key-value-change';

export default class ClientUserConnection {
  private socket: Socket;
  private onDisconnect: OldObservable;

  constructor(private url: string) {
    this.onDisconnect = new Observable();
  }

  private _connected: boolean;

  public get connected() {
    return this._connected;
  }
  public get id() {
    return this.socket.id;
  }

  async connect(msTimeout = 5000): Promise<void> {
    if (this._connected) return;

    const connectionAwaiter = new Awaiter();
    this.socket = io(this.url);

    this.socket.on('connect', () => {
      this.connectionFinish();
      connectionAwaiter.complete();
    });

    await connectionAwaiter.getPromise(msTimeout);
  }

  async joinRoom(roomName: string, msTimeout = 5000): Promise<ServerOperationResult> {
    return this.roomOperation('joinRoom', roomName, msTimeout);
  }

  async createRoom(roomName: string, msTimeout = 5000): Promise<ServerOperationResult> {
    return this.roomOperation('createRoom', roomName, msTimeout);
  }

  async leaveRoom(msTimeout = 5000): Promise<ServerOperationResult> {
    return this.roomOperation('leaveRoom', undefined, msTimeout);
  }
  async disconnect(): Promise<void> {
    if (this._connected == false) return;

    this._connected = false;

    const disconnectionAwaiter = new Awaiter();

    const disconnectionEvent = () => {
      disconnectionAwaiter.complete();
      this.onDisconnect.removeListener(disconnectionEvent);
    };
    this.onDisconnect.addListener(disconnectionEvent);

    this.socket.emit('server-disconnection');

    await disconnectionAwaiter.getPromise();
  }

  async setData(data: KeyValueDataChange, msTimeout = 5000) {
    const awaiter = new Awaiter();
    this.socket.emit('setData', data, () => {
      awaiter.complete();
    });

    await awaiter.getPromise(msTimeout);
  }

  async removeData(keys: string[], msTimeout = 5000) {
    const awaiter = new Awaiter();
    this.socket.emit('removeData', keys, () => {
      awaiter.complete();
    });

    await awaiter.getPromise(msTimeout);
  }

  private roomOperation(opName: string, roomName: string | undefined, msTimeout: number): Promise<ServerOperationResult> {
    this.connectionCheck();
    const joinAwaiter = new GenericAwaiter<ServerOperationResult>();
    if (roomName != undefined) {
      this.socket.emit(opName, roomName, (response: ServerOperationResult) => {
        joinAwaiter.complete(response);
      });
    } else {
      this.socket.emit(opName, (response: ServerOperationResult) => {
        joinAwaiter.complete(response);
      });
    }
    return joinAwaiter.getPromise(msTimeout);
  }

  private connectionCheck() {
    if (this.connected == false) {
      throw new Error('Client isn\'t connected');
    }
  }

  private connectionFinish() {
    this._connected = true;
    this.socket.off('connect');
    this.socket.on('disconnect', () => {
      this.socket.off('disconnect');
      this._connected = false;
      this.onDisconnect.invoke();
    });
  }
}
