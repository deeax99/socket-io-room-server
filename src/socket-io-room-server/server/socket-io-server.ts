import 'reflect-metadata';
import { injectable } from 'inversify';
import * as SocketIO from 'socket.io';
import { IServer } from './types/server';
import { IServerConnection } from "./types/server-connection";
import { GenericObservable, IGenericObservable, IGenericObservableReader } from '@util/observable';
import { SocketIOConnection } from './socket-io-connection';

@injectable()
export default class SocketIOServer implements IServer {
  private io: SocketIO.Server;

  private _onConnectionEvent: IGenericObservable<IServerConnection>;
  public get onConnectionEvent(): IGenericObservableReader<IServerConnection> {
    return this._onConnectionEvent;
  }

  constructor() {
    this._onConnectionEvent = new GenericObservable<IServerConnection>();
    this.io = new SocketIO.Server({
      cors: {
        origin: '*',
      },
    });
  }

  listen(port: number) {
    this.io.listen(port);
    this.io.on('connection', (socket) => {
      const connection = new SocketIOConnection(socket);
      this._onConnectionEvent.notify(connection);
    });
  }

  close() {
    this.io.close();
  }
}


