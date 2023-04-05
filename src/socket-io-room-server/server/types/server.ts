import { IGenericObservableReader } from '@util/observable';
import { IServerConnection } from './server-connection';

export const SERVER_SYMBOL = Symbol('server');

export interface IServer {
    get onConnectionEvent(): IGenericObservableReader<IServerConnection>;
    listen(port: number);
    close();
}