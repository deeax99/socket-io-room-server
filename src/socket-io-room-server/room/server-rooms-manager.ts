import 'reflect-metadata';
import ServerUser from '../user/server-user';
import ServerOperationResult from '../dto/server-operation-result';
import { ServerUserConnectionState } from '../user/server-user-connection-state-handler';
import { IServerRoomsManager, ServerOperationCallbackType } from './types/server-rooms-manager';
import { inject, injectable } from 'inversify';
import { IServerRoom, SERVER_ROOMS_FACTORY_SYMBOL } from './types/server-room';
import { UserDataValue } from '../dto/data-key-value-change';
import { IServerRoomFactory } from './types/server-room-factory';
import { RoomOperationsErrors } from '@server-room/dto/room-operations-errors';

type Rooms = { [id: string]: IServerRoom };

@injectable()
export default class ServerRoomsManager implements IServerRoomsManager {

  private rooms: Rooms = {};
  constructor(@inject(SERVER_ROOMS_FACTORY_SYMBOL) private roomFactory: IServerRoomFactory) { }

  joinRoom(user: ServerUser, roomName: string, callback: ServerOperationCallbackType) {
    let errorOp;
    if (!this.isRoomExist(roomName)) {
      errorOp = RoomOperationsErrors.RoomNotExist;
    } else if (user.connectionStateHandler.state != ServerUserConnectionState.Connected) {
      errorOp = RoomOperationsErrors.UserInJoinedState;
    } else {
      this.joinRoomUnsafe(user, roomName, callback);
      return;
    }
    callback(ServerOperationResult.failed(errorOp));
  }

  createRoom(owner: ServerUser, roomName: string, callback: ServerOperationCallbackType) {
    let errorOp;
    if (this.isRoomExist(roomName)) {
      errorOp = RoomOperationsErrors.RoomExist;
    } else if (owner.connectionStateHandler.state != ServerUserConnectionState.Connected) {
      errorOp = RoomOperationsErrors.UserInJoinedState;
    } else {
      this.createRoomUnsafe(owner, roomName, callback);
      return;
    }
    callback(ServerOperationResult.failed(errorOp));
  }

  leaveRoom(user: ServerUser, callback: ServerOperationCallbackType) {
    if (user.connectionStateHandler.state != ServerUserConnectionState.InRoom) {
      callback(ServerOperationResult.failed(RoomOperationsErrors.UserNotInJoinedState));
    } else {
      const roomName = user.connectionStateHandler.roomName;
      const room = this.rooms[roomName];
      room.leaveUser(user, () => callback(ServerOperationResult.succeed()));
    }
  }

  private removeRoomCallback(roomName: string) {
    delete this.rooms[roomName];
  }

  private isRoomExist(roomName: string) {
    return roomName in this.rooms;
  }

  private createRoomUnsafe(owner: ServerUser, roomName: string, callback: ServerOperationCallbackType) {
    const newRoom = this.roomFactory.createRoom(owner, roomName, () => this.removeRoomCallback(roomName));
    this.rooms[roomName] = newRoom;
    callback(ServerOperationResult.succeed());
  }

  private joinRoomUnsafe(user: ServerUser, roomName: string, callback: ServerOperationCallbackType) {
    const room = this.rooms[roomName];
    room.joinUser(user, (dto) => callback(ServerOperationResult.succeed(dto as UserDataValue)));
  }
}