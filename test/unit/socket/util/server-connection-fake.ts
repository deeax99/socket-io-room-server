import { Args, ArgsCallback, DisconnectionCallback, IServerConnection } from "@server-room/server/types/server-connection";

export class ServerConnectionFake implements IServerConnection {

  private onEvents: { [key: string]: ArgsCallback[]; } = {};
  public emitEvents: [string, Args][] = [];

  private disconnectionCallback: DisconnectionCallback[] = [];

  constructor(private connectionID: string = 'testUser') { }

  emit(eventName: string, ...args: Args) {
    this.emitEvents.push([eventName, args]);
  }

  receive(eventName: string, ...args: Args) {
    if (eventName in this.onEvents) {
      this.onEvents[eventName].forEach((callback) => callback(...args));
    }
  }

  on = jest.fn((eventName: string, callback: ArgsCallback) => {
    if (!(eventName in this.onEvents)) {
      this.onEvents[eventName] = [];
    }
    this.onEvents[eventName].push(callback);
  })

  addDisconnectionListener = jest.fn(callback => {
    this.disconnectionCallback.push(callback);
  });

  disconnect = jest.fn(() => {
    this.disconnectionCallback.forEach((callback) => callback());
  })

  get id(): string {
    return this.connectionID;
  }
}
