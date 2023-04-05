import * as SocketIO from 'socket.io';
import { IServerConnection } from "./types/server-connection";
import { Observable } from '../../util/observable';


export class SocketIOConnection implements IServerConnection {
  get id() {
    return this.socket.id;
  }

  private onDisconnectObservable: Observable;

  constructor(private socket: SocketIO.Socket) {
    this.onDisconnectObservable = new Observable();
    socket.on('disconnect', () => {
      this.onDisconnectObservable.notify();
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  emit(eventName: string, ...args: unknown[]) {
    this.socket.emit(eventName, args);
  }

  on(eventName: string, callback: (...args: unknown[]) => void) {
    this.socket.on(eventName, callback);
  }

  addDisconnectionListener(callback: () => void) {
    this.onDisconnectObservable.addListener(callback);
  }
}
