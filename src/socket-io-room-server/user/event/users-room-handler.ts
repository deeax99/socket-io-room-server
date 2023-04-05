import 'reflect-metadata';
import ServerUserCreationHandler, { SERVER_USER_CREATION_SYMBOL } from '../server-user-creation-handler';
import ServerUser from '../server-user';
import { inject, injectable } from 'inversify';
import { IServerRoomsManager, SERVER_ROOMS_MANAGER_SYMBOL, ServerOperationCallbackType } from '../../room/types/server-rooms-manager';
import { unknownToString, unknownToCallback } from '../../../util/unknown-converter';

export const USER_ROOM_HANDLER_SYMBOL = Symbol('UsersRoomHandler');

@injectable()
export default class UsersRoomHandler {
  constructor(
    @inject(SERVER_USER_CREATION_SYMBOL) usersHandler: ServerUserCreationHandler,
    @inject(SERVER_ROOMS_MANAGER_SYMBOL) private serverRoomManager: IServerRoomsManager) {
    usersHandler.onUserConnect.addListener(this.handleUser);
  }

  handleUser = (serverUser: ServerUser) => {
    const socket = serverUser.connection;
    
    socket.on('joinRoom', (unknownName, unknownCallback) => {
      const name = unknownToString(unknownName);
      const callback = unknownToCallback<ServerOperationCallbackType>(unknownCallback);
      this.serverRoomManager.joinRoom(serverUser, name, callback);
    });

    socket.on('leaveRoom', (unknownCallback) => {
      const callback = unknownToCallback<ServerOperationCallbackType>(unknownCallback);
      this.serverRoomManager.leaveRoom(serverUser, callback);
    });

    socket.on('createRoom', (unknownName, unknownCallback) => {
      const name = unknownToString(unknownName);
      const callback = unknownToCallback<ServerOperationCallbackType>(unknownCallback);
      this.serverRoomManager.createRoom(serverUser, name, callback);
    });
  };
}
