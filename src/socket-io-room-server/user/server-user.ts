import { GenericObservable } from '../../util/observable';
import ServerUserConnectionStateHandler from './server-user-connection-state-handler';
import ServerUserDataHandler from './server-user-data-handler';
import { IServerConnection } from "../server/types/server-connection";

export default class ServerUser {
  private serverUserConnectionStateHandler: ServerUserConnectionStateHandler;
  private serverUserDataHandler: ServerUserDataHandler;

  public onDisconnect: GenericObservable<ServerUser>;

  public get id() {
    return this.connection.id;
  }
  public get connectionStateHandler(): ServerUserConnectionStateHandler {
    return this.serverUserConnectionStateHandler;
  }
  public get connection(): IServerConnection {
    return this.serverConnection;
  }
  public get dataHandler(): ServerUserDataHandler {
    return this.serverUserDataHandler;
  }

  constructor(private serverConnection: IServerConnection) {
    this.onDisconnect = new GenericObservable<ServerUser>();
    this.serverUserConnectionStateHandler = new ServerUserConnectionStateHandler();
    this.serverUserDataHandler = new ServerUserDataHandler();

    serverConnection.addDisconnectionListener(() => {
      this.serverUserConnectionStateHandler.disconnect();
      this.onDisconnect.notify(this);
    });
  }
}
