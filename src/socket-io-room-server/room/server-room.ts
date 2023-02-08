import ServerUser from "../user/server-user";
import ServerRoomsHandler from "./server-rooms-handler";

export default class ServerRoom {
    private users: ServerUser[] = [];
    constructor(
        private owner: ServerUser,
        private roomName: string,
        private roomsHandler: ServerRoomsHandler) {
        this.joinUser(owner);
    }

    joinUser(user: ServerUser) {
        this.users.push(user);
        user.onDisconnect.addListener(this.disconnectUser);
        user.connectionState.joinRoom(this.roomName);
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
