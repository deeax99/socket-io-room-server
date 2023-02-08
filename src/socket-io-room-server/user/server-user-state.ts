export enum ServerUserConnectionState {
    Connected, Disconnected, InRoom
}
export default class ServerUserConnectionStateHandler {

    private _state: ServerUserConnectionState = ServerUserConnectionState.Connected;
    private _roomName?: string;

    public get state(): ServerUserConnectionState { return this._state; }
    public get roomName(): string { return this._roomName; }

    joinRoom(roomName: string) {
        if (this._state != ServerUserConnectionState.Connected) {
            throw new Error(`Can't join the room with state ${this._state}`);
        }
        
        this._state = ServerUserConnectionState.InRoom;
        this._roomName = roomName;
    }

    leaveRoom() {
        if (this._state != ServerUserConnectionState.InRoom) {
            throw new Error(`Can't leave the room with state ${this._state}`);
        }

        this._state = ServerUserConnectionState.Connected;
        this._roomName = undefined;
    }

    disconnect() {
        this._state = ServerUserConnectionState.Disconnected;
        this._roomName = undefined;
    }
}