import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { GenericObservable, IGenericObservable } from '../../util/observable';
import ServerUser from './server-user';
import { IServer, SERVER_SYMBOL } from '../server/types/server';
import { IServerConnection } from "../server/types/server-connection";

export const SERVER_USER_CREATION_SYMBOL = Symbol('ServerUserCreationHandler');

@injectable()
export default class ServerUserCreationHandler {

  private _onUserConnect: GenericObservable<ServerUser>;
  get onUserConnect(): IGenericObservable<ServerUser> {
    return this._onUserConnect;
  }

  constructor(@inject(SERVER_SYMBOL) server: IServer) {
    this._onUserConnect = new GenericObservable<ServerUser>();
    server.onConnectionEvent.addListener((connection) => this.addNewClientConnection(connection));
  }

  private addNewClientConnection(connection: IServerConnection): void {
    const user = new ServerUser(connection);
    this._onUserConnect.notify(user);
  }
}
