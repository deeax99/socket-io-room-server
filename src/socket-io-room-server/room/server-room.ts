import ServerUser from '../user/server-user';
import RoomChangeBuilder from '../dto/room-change-builder';
import { RoomChangeDto } from '../dto/room-change.dto';
import { IServerRoom, RoomDestroyCallback } from './types/server-room';
import ServerRoomEvent  from './room-util/server-room-event';

class ServerRoomData {
  private _users: ServerUser[] = [];
  public get users() {
    return this._users;
  }
  public get owner() {
    return this._owner;
  }
  public get roomName() {
    return this._roomName;
  }
  constructor(
    private _owner: ServerUser,
    private _roomName: string,
    private roomDestroyCallback: RoomDestroyCallback) { }

  addUser(user: ServerUser) {
    this._users.push(user);
  }

  removeUser(user: ServerUser) {
    this._users = this.users.filter((filterUser) => filterUser != user);
  }

  updateOwner() {
    this._owner = this._users[0];
  }

  triggerDestroyCallback() {
    this.roomDestroyCallback();
  }
}

class ServerRoomState {
  constructor(private roomData: ServerRoomData) { }

  getRoomStateWithoutUser(user: ServerUser): RoomChangeDto {
    return RoomChangeBuilder.Builder()
      .addUsersExpect(this.roomData.users, user)
      .setOwner(this.roomData.owner)
      .build();
  }
}

class ServerRoomConnectionHandler {
  constructor(private roomData: ServerRoomData, private roomEvent: ServerRoomEvent) {
    roomEvent.onUserJoin.pre.addListener(this.preUserJoin);
    roomEvent.onUserLeave.pre.addListener(this.preUserLeave);
    roomEvent.onUserDisconnect.pre.addListener(this.preUserDisconnection);
  }

  preUserJoin = (user: ServerUser) => {
    this.roomData.addUser(user);
    user.onDisconnect.addListener(this.disconnectUser);
    user.connectionStateHandler.joinRoom(this.roomData.roomName);
  };

  preUserLeave = (user: ServerUser) => {
    this.removeUser(user);
    user.connectionStateHandler.leaveRoom();
  };

  preUserDisconnection = (user: ServerUser) => {
    this.removeUser(user);
  };

  private disconnectUser = (user: ServerUser) => {
    this.roomEvent.onUserDisconnect.notify(user);
  };

  private removeUser(user: ServerUser) {
    this.roomData.removeUser(user);
    user.onDisconnect.removeListener(this.disconnectUser);
  }
}

class RoomLeaverHandler {
  constructor(private roomData: ServerRoomData, private roomEvent: ServerRoomEvent) {
    roomEvent.onUserLeave.pre.addListener(this.preLeave);
    roomEvent.onUserDisconnect.pre.addListener(this.preLeave);
  }

  preLeave = () => {
    if (this.roomData.users.length == 0) {
      this.roomData.triggerDestroyCallback();
    } else {
      this.roomData.updateOwner();
    }
  };
}

export default class ServerRoom implements IServerRoom {
  private roomEvent: ServerRoomEvent;
  private roomState: ServerRoomState;
  private roomData: ServerRoomData;

  constructor(owner: ServerUser, roomName: string, roomDestroyCallback: RoomDestroyCallback) {
    this.roomData = new ServerRoomData(owner, roomName, roomDestroyCallback);
    this.roomState = new ServerRoomState(this.roomData);
    this.roomEvent = new ServerRoomEvent();
    this.setupHandlers();
    this.joinUser(owner, undefined);
  }

  private setupHandlers() {
    new ServerRoomConnectionHandler(this.roomData, this.roomEvent);
    new RoomLeaverHandler(this.roomData, this.roomEvent);
  }

  joinUser(user: ServerUser, callback: (dto: RoomChangeDto) => void) {
    this.roomEvent.onUserJoin.notify(user, () => {
      if (callback != undefined) {
        const state = this.roomState.getRoomStateWithoutUser(user);
        callback(state);
      }
    });
  }

  leaveUser(user: ServerUser, callback: () => void) {
    this.roomEvent.onUserLeave.notify(user, () => {
      callback();
    });
  }
}
