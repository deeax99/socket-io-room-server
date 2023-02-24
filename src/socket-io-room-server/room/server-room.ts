import ServerUser from "../user/server-user";
import { RoomChangeBuilder } from "./dto/room-change-builder";
import { RoomChangeDto } from "./dto/room-change.dto";
import ServerRoomsHandler from "./server-rooms-handler";

export default class ServerRoom {
    private users: ServerUser[] = [];
    constructor(
        private owner: ServerUser,
        private roomName: string,
        private roomsHandler: ServerRoomsHandler) {
        this.joinUser(owner);
    }

    getCurrentRoomState () : RoomChangeDto {
        return RoomChangeBuilder.Builder()
                                .addUsers(this.users)
                                .setOwner(this.owner)
                                .build();
    }

    joinUser(user: ServerUser) : RoomChangeDto {
        const state = this.getCurrentRoomState ();

        this.users.push(user);
        user.onDisconnect.addListener(this.disconnectUser);
        user.connectionState.joinRoom(this.roomName);
        
        return state;
    }

    leaveUser = (user: ServerUser) => {
        this.removeUser(user);
        user.connectionState.leaveRoom();
    }

    private disconnectUser = (user: ServerUser) => {
        this.removeUser(user);
    }

    private removeUser (user: ServerUser) {
        this.users = this.users.filter(filterUser => filterUser != user);
        user.onDisconnect.removeListener(this.disconnectUser);
        this.checkRoomState(user);
    }

    private checkRoomState(user: ServerUser) {
        if (user == this.owner) {
            if (this.users.length == 0) {
                this.removeRoom();
            }
            else {
                this.changeOwner();
            }
        }
    }
    private changeOwner() {
        this.owner = this.users[0];
        //send notification
    }
    private removeRoom() {
        this.roomsHandler.removeRoom(this.roomName);
    }

}