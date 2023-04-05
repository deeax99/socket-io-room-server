import 'reflect-metadata';
import ServerUserCreationHandler, { SERVER_USER_CREATION_SYMBOL } from '../server-user-creation-handler';
import ServerUser from '../server-user';
import { inject, injectable } from 'inversify';

export const USER_DISCONNECTION_HANDLER_SYMBOL = Symbol('UsersDisconnectionHandler');

@injectable()
export default class UsersDisconnectionHandler {
  constructor(@inject(SERVER_USER_CREATION_SYMBOL) usersHandler: ServerUserCreationHandler) {
    usersHandler.onUserConnect.addListener(this.handleUser);
  }

  handleUser = (serverUser: ServerUser) => {
    const socket = serverUser.connection;

    socket.on('server-disconnection', () => {
      socket.disconnect();
    });
  };
}
