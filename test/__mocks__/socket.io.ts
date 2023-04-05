import { ArgsCallback } from "@server-room/server/types/server-connection";

export const Server = jest.fn(() => new ServerImp());
export const Socket = jest.fn(() => new SocketImp());

class ServerImp {

    private onEvents: { [key: string]: ArgsCallback[]; } = {};

    on = jest.fn((eventName, callback) => {
        if (!(eventName in this.onEvents)) {
            this.onEvents[eventName] = [];
        }
        this.onEvents[eventName].push(callback);
    })
    receive = jest.fn((eventName, ...args) => {
        if (eventName in this.onEvents) {
            this.onEvents[eventName].forEach((callback) => callback(...args));
        }
    })

    listen = jest.fn();
    close = jest.fn();
}

class SocketImp {

    get id() { return "100" }
    private onEvents: { [key: string]: ArgsCallback[]; } = {};

    on = jest.fn((eventName, callback) => {
        if (!(eventName in this.onEvents)) {
            this.onEvents[eventName] = [];
        }
        this.onEvents[eventName].push(callback);
    })
    receive = jest.fn((eventName, ...args) => {
        if (eventName in this.onEvents) {
            this.onEvents[eventName].forEach((callback) => callback(...args));
        }
    })

    emit = jest.fn();
    disconnect = jest.fn(() => {
        this.receive("disconnect");
    });
}