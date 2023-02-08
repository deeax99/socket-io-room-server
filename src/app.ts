
import { container, singleton } from "tsyringe";
import SocketIOServer from "./socket-io-room-server/server/socket-io-server";
import ServerRoomsHandler from "./socket-io-room-server/room/server-rooms-handler";
import ServerUsersHandler from "./socket-io-room-server/user/server-users-handler";
import UsersRoomHandler from "./socket-io-room-server/user/event/users-room-handler";
import UsersDisconnectionHandler from "./socket-io-room-server/user/event/user-disconnection-handler";

type constructor<T> = {
    new(...args: any[]): T;
};

export const appServices:constructor<any>[] = [
    SocketIOServer,
    ServerRoomsHandler,
    ServerUsersHandler,
    UsersRoomHandler,
    UsersDisconnectionHandler
];

@singleton()
export class App {
    constructor(private socketIOServer: SocketIOServer) {}
    public run = () => {
        console.log("server is running");
        this.socketIOServer.listen(3000);
    }
}

export function instantiateServices () {
    appServices.forEach(service => {
        container.resolve(service);
    });
}

