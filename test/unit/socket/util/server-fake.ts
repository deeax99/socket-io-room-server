import { IServer } from "@server-room/server/types/server";
import { IServerConnection } from "@server-room/server/types/server-connection";
import { GenericObservable, IGenericObservableReader } from "@util/observable";

export class ServerFake implements IServer {
    
    private _onConnectionEvent:GenericObservable<IServerConnection>;

    constructor () {
        this._onConnectionEvent = new GenericObservable<IServerConnection>();
    }
    
    listen = jest.fn() 
    close = jest.fn()
    
    get onConnectionEvent(): IGenericObservableReader<IServerConnection> {
        return this._onConnectionEvent;
    }

} 