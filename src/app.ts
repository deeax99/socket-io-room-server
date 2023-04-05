
import SocketIOServer from './socket-io-room-server/server/socket-io-server';
import ServerRoomsManager from './socket-io-room-server/room/server-rooms-manager';
import ServerUserCreationHandler from './socket-io-room-server/user/server-user-creation-handler';
import UsersRoomHandler from './socket-io-room-server/user/event/users-room-handler';
import UsersDisconnectionHandler from './socket-io-room-server/user/event/user-disconnection-handler';
import UserDataHandler from './socket-io-room-server/user/event/user-data-handler';
import { Container, ContainerModule, interfaces } from 'inversify';

type constructor<T> = {
  new(...args: any[]): T;
};

export const appServices: constructor<any>[] = [
  SocketIOServer,
  ServerRoomsManager,
  ServerUserCreationHandler,
  UsersRoomHandler,
  UsersDisconnectionHandler,
  UserDataHandler,
];

@singleton()
export class App {
  constructor(private socketIOServer: SocketIOServer) { }
  public run = () => {
    console.log('server is running');
    this.socketIOServer.listen(3000);
  };
}

export function instantiateServices() {
  appServices.forEach((service) => {
    container.resolve(service);
  });
}

export function getContainer() {
  const cs = new Container();
}

class MainContainer extends ContainerModule {
  constructor() {
    super((bind: interfaces.Bind) => {

    });
  }
}
