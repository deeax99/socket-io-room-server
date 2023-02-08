import { injectable, singleton } from "tsyringe";
import { GenericObservable } from "../../util/observable";
import SocketIOServer from "../server/socket-io-server";
import ServerUser from "./server-user";
import { Socket } from "socket.io";
@singleton()
export default class ServerUsersHandler {
    public onUserConnect:GenericObservable<ServerUser>;

    constructor(socketServer: SocketIOServer) {
        const server = socketServer.server;
        this.onUserConnect = new GenericObservable<ServerUser>();
        server.on("connection", (socket) => this.addNewClientConnection(socket));
    }

    addNewClientConnection(socket: Socket): void {
        const user = new ServerUser(socket);
        this.onUserConnect.invoke(user);
    }
}