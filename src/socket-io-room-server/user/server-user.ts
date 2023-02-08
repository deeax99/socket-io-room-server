import { Socket } from "socket.io";
import { GenericObservable } from "../../util/observable";
import ServerUserRoomState from "./server-user-state";

export default class ServerUser {

    private _connectionState: ServerUserRoomState;

    public onDisconnect: GenericObservable<ServerUser>;

    public get id() { return this.socket.id; }
    public get connectionState(): ServerUserRoomState { return this._connectionState; }
    public get getSocket(): Socket { return this.socket; }

    constructor(private socket: Socket) {
        this.onDisconnect = new GenericObservable<ServerUser>();
        this._connectionState = new ServerUserRoomState();
        
        socket.on("disconnect", () => {
            this.disconnectionHandler();
            this._connectionState.disconnect();
        });
    }

    private disconnectionHandler() {
        this.onDisconnect.invoke(this);
    }
}
