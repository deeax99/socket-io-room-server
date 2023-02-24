import { injectable, singleton } from "tsyringe";
import ServerUsersHandler from "../server-users-handler";
import ServerUser from "../server-user";
import ServerRoomsHandler from "../../room/server-rooms-handler";
@singleton()
export default class UserDataHandler {
    constructor(usersHandler:ServerUsersHandler) {
        usersHandler.onUserConnect.addListener(this.handleUser);
    }

    handleUser = (userConnection:ServerUser) => {
        const socket = userConnection.getSocket; 
        
        socket.on("setData" , (obj , callback) => {
            userConnection.dataHandler.setData(obj);
            callback();
        });

        socket.on("removeData" , (keys , callback) => {
            userConnection.dataHandler.removeData(keys);
            callback();
        });
    }
} 