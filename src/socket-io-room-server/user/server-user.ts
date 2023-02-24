import { Socket } from "socket.io";
import { GenericObservable } from "../../util/observable";
import ServerUserConnectionStateHandler from "./server-user-connection-state-handler";
import ServerUserDataHandle from "./server-user-data-handler";

export default class ServerUser {

    private _connectionState: ServerUserConnectionStateHandler;
    private _dataHandler: ServerUserDataHandle;

    public onDisconnect: GenericObservable<ServerUser>;

    public get id() { return this.socket.id; }
    public get connectionState(): ServerUserConnectionStateHandler { return this._connectionState; }
    public get getSocket(): Socket { return this.socket; }
    public get dataHandler(): ServerUserDataHandle { return this._dataHandler; }

    constructor(private socket: Socket) {
        this.onDisconnect = new GenericObservable<ServerUser>();
        this._connectionState = new ServerUserConnectionStateHandler();
        this._dataHandler = new ServerUserDataHandle();

        socket.on("disconnect", () => {
            this.disconnectionHandler();
            this._connectionState.disconnect();
        });
    }

    private disconnectionHandler() {
        this.onDisconnect.invoke(this);
    }
}
