import { injectable, singleton } from "tsyringe";
import ServerUsersHandler from "../server-users-handler";
import ServerUser from "../server-user";
import ServerRoomsHandler from "../../room/server-rooms-handler";
@singleton()
export default class UsersRoomHandler {
    constructor(usersHandler:ServerUsersHandler , private roomsHandler : ServerRoomsHandler) {
        usersHandler.onUserConnect.addListener(this.handleUser);
    }

    handleUser = (userConnection:ServerUser) => {
        const socket = userConnection.getSocket; 
        
        socket.on("joinRoom" , (name , callback) => {
            const result = this.roomsHandler.joinRoom(userConnection , name);
            callback(result);
        });
        
        socket.on("leaveRoom" , (callback) => {
            const result = this.roomsHandler.leaveRoom(userConnection);
            callback(result);
        });

        socket.on("createRoom" , (name , callback) => {
            const result = this.roomsHandler.createRoom(userConnection , name);
            callback(result);
        });
    }
} 