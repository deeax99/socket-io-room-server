import { container } from "tsyringe";
import ServerUser from "../user/server-user";
import RoomChangeBuilder from "./dto/room-change-builder";
import { RoomChangeDto } from "./dto/room-change.dto";
import ServerRoomsHandler from "./server-rooms-handler";
import { GenericObservableStagin } from "../../util/observable";

class ServerRoomData {
    private _users: ServerUser[] = [];
    public get users() { return this._users; }
    public get owner() { return this._owner; }
    constructor(
        private _owner: ServerUser,
        public roomName: string) { }

    addUser(user: ServerUser) {
        this._users.push(user);
    }
    removeUser(user: ServerUser) {
        this._users = this.users.filter(filterUser => filterUser != user);
    }

    updateOwner() {
        this._owner = this._users[0];
    }
}

class ServerRoomEvent {
    onUserJoin: GenericObservableStagin<ServerUser> = new GenericObservableStagin();
    onUserLeave: GenericObservableStagin<ServerUser> = new GenericObservableStagin();
    onUserDisconnect: GenericObservableStagin<ServerUser> = new GenericObservableStagin();
}

class ServerRoomState {
    constructor(private roomData: ServerRoomData) {}
    
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
        user.connectionState.joinRoom(this.roomData.roomName);
    }

    preUserLeave = (user: ServerUser) => {
        this.removeUser(user);
        user.connectionState.leaveRoom();
    }

    preUserDisconnection = (user: ServerUser) => {
        this.removeUser(user);
    }

    private disconnectUser = (user: ServerUser) => {
        this.roomEvent.onUserDisconnect.invoke(user);
    }

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

    preLeave = (user: ServerUser) => {
        if (this.roomData.users.length == 0) {
            const roomsHandler = container.resolve(ServerRoomsHandler);
            roomsHandler.removeRoom(this.roomData.roomName);

        }
        else {
            this.roomData.updateOwner();
        }
    }
}

export default class ServerRoom {
    private roomEvent: ServerRoomEvent;
    private roomState: ServerRoomState;
    private roomData: ServerRoomData;

    private constructor(owner: ServerUser, roomName: string) {
        this.roomData = new ServerRoomData(owner, roomName);
        this.roomState = new ServerRoomState(this.roomData);
        this.roomEvent = new ServerRoomEvent();
        this.setup();
    }

    static CreateRoom(owner: ServerUser, roomName: string): ServerRoom {
        const room = new ServerRoom(owner, roomName);
        room.joinUser(owner, undefined);
        return room;
    }

    setup() {
        const connectionHandler = new ServerRoomConnectionHandler(this.roomData, this.roomEvent);
        const leaveHandler = new RoomLeaverHandler(this.roomData, this.roomEvent);
    }

    joinUser(user: ServerUser, callback: (dto: RoomChangeDto) => any) {
        this.roomEvent.onUserJoin.invoke(user, () => {
            if (callback != undefined) {
                const state = this.roomState.getRoomStateWithoutUser(user);
                callback(state);
            }
        });
    }

    leaveUser(user: ServerUser, callback: () => any) {
        this.roomEvent.onUserLeave.invoke(user, () => {
            callback();
        });
    }
}