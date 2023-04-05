import { UserDataValue } from "@server-room/dto/data-key-value-change";
import { IServerConnection } from "@server-room/server/types/server-connection";
import ServerUser from "@server-room/user/server-user";
import ServerUserConnectionStateHandler, { ServerUserConnectionState } from "@server-room/user/server-user-connection-state-handler";
import ServerUserDataHandler from "@server-room/user/server-user-data-handler";
import { ServerConnectionFake } from '../util/server-connection-fake';

jest.mock("@util/observable");

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
})

describe("ServerUserDataHandler" , () => {
  
  let serverUserDataHandler:ServerUserDataHandler;

  beforeEach(() => {
    serverUserDataHandler = new ServerUserDataHandler();
  })

  it("should constructor create data map" , () => {
    expect(serverUserDataHandler["userData"]).not.toBeNull();
  })

  it ("should getData return the data" , () => {
    serverUserDataHandler["userData"] = new Map<string , UserDataValue>([["name" , "user0"] , ["level" , 1000]]);
    expect(serverUserDataHandler.getData()).toStrictEqual({"name" : "user0" , "level" : 1000})
  })

  it ("should setData add data to the map" , () => {
    const setData1 = {"name" : "user0" , "id" : 7};
    const setData2 = {"name" : "user0-super" , "level" : 100};
    
    expect(serverUserDataHandler.getData()).toStrictEqual({});

    serverUserDataHandler.setData(setData1);
    expect(serverUserDataHandler.getData()).toStrictEqual(setData1);

    serverUserDataHandler.setData(setData2);
    expect(serverUserDataHandler.getData()).toStrictEqual({...setData1 , ...setData2});
  })

  it("should removeKey remove keys" , () => {
    serverUserDataHandler["userData"] = new Map<string , UserDataValue>([["name" , "user0"] , ["level" , 1000] , ["id" , 8] , ["joinData" , "today"]]);
    serverUserDataHandler.removeData(["name" , "level"]);
    expect(serverUserDataHandler.getData()).toStrictEqual({"joinData" : "today" , "id" : 8});   
  })
})

describe("ServerUserConnectionStateHandler" , () => {

  let serverUserConnectionStateHandler:ServerUserConnectionStateHandler;

  beforeEach(() => {
    serverUserConnectionStateHandler = new ServerUserConnectionStateHandler();
  })

  it ("should initial state be connected" , () => {
    expect(serverUserConnectionStateHandler.state).toBe(ServerUserConnectionState.Connected);
  })

  it ("should join change state to joined and set roomName when state is Connected" , () => {
    serverUserConnectionStateHandler["_state"] = ServerUserConnectionState.Connected;
    expect(() => serverUserConnectionStateHandler.joinRoom("room")).not.toThrow();
    
    expect(serverUserConnectionStateHandler.state).toBe(ServerUserConnectionState.InRoom);
    expect(serverUserConnectionStateHandler.roomName).toBe("room");
  })

  it ("should join throw error when trying to join with any state other than Connected" , () => {

    serverUserConnectionStateHandler["_state"] = ServerUserConnectionState.InRoom;
    expect(() => serverUserConnectionStateHandler.joinRoom("any")).toThrow();

    serverUserConnectionStateHandler["_state"] = ServerUserConnectionState.Disconnected;
    expect(() => serverUserConnectionStateHandler.joinRoom("any")).toThrow();
  })

  it ("should leaveRoom change state to Connected when state InRoom and set roomName to undefined" , () => {
    serverUserConnectionStateHandler["_state"] = ServerUserConnectionState.InRoom;
    expect(() => serverUserConnectionStateHandler.leaveRoom()).not.toThrow();
    expect(serverUserConnectionStateHandler.state).toBe(ServerUserConnectionState.Connected);
    expect(serverUserConnectionStateHandler.roomName).toBeUndefined();
  })

  it ("should leaveRoom throw error when trying to join with any state other than InRoom " , () => {
    serverUserConnectionStateHandler["_state"] = ServerUserConnectionState.Disconnected;
    expect(() => serverUserConnectionStateHandler.leaveRoom()).toThrow();

    serverUserConnectionStateHandler["_state"] = ServerUserConnectionState.Connected;
    expect(() => serverUserConnectionStateHandler.leaveRoom()).toThrow();
  })

  it ("should disconnect change state to Disconnect and set roomName to undefined" , () => {
    expect(() => serverUserConnectionStateHandler.disconnect()).not.toThrow();
    expect(serverUserConnectionStateHandler.state).toBe(ServerUserConnectionState.Disconnected);
    expect(serverUserConnectionStateHandler.roomName).toBeUndefined();
  })
})

describe('ServerUser', () => {
  
  let serverUser:ServerUser;
  let serverConnection:IServerConnection;

  beforeEach(() => {
    serverConnection = new ServerConnectionFake();
    serverUser = new ServerUser(serverConnection);
  });

  it ("should constructor initialize variables" , () => {
    expect(serverUser.connection).toBe(serverConnection);
    expect(serverUser.connectionStateHandler).not.toBeNull();
    expect(serverUser.dataHandler).not.toBeNull();
    expect(serverUser.onDisconnect).not.toBeNull();
  })

  it ("should id return connection id", () => {
    expect(serverUser.id).toBe(serverConnection.id);
  })

  it ("should constructor add listener to connection disconnection event" , () => {
    expect(serverConnection.addDisconnectionListener).toBeCalledTimes(1);
  })

  it ("should change state to Disconnected and trigger onDisconnect when connection disconnect" , () => {
    serverUser.connectionStateHandler.disconnect = jest.fn();
    serverConnection.disconnect();

    expect(serverUser.onDisconnect.notify).toBeCalledTimes(1);
    expect(serverUser.connectionStateHandler.disconnect).toBeCalledTimes(1);
  })
});