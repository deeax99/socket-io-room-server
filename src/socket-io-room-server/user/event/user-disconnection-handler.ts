import { injectable, singleton } from "tsyringe";
import ServerUsersHandler from "../server-users-handler";
import ServerUser from "../server-user";
import ServerRoomsHandler from "../../room/server-rooms-handler";
@singleton()
export default class UsersDisconnectionHandler {
    constructor(usersHandler:ServerUsersHandler) {
        usersHandler.onUserConnect.addListener(this.handleUser);
    }

    handleUser = (userConnection:ServerUser) => {
        const socket = userConnection.getSocket; 
        
        socket.on("server-disconnection" , () => {
            socket.disconnect()
        });
    }
} 