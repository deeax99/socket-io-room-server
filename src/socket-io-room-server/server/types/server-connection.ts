export type Args = unknown[]
export type ArgsCallback = (...args: Args) => void
export type DisconnectionCallback = () => void;

export interface IServerConnection {
    get id(): string;
    emit(eventName: string, ...args: Args);
    on(eventName: string, callback: ArgsCallback);
    addDisconnectionListener(callback: () => void);
    disconnect();
}
