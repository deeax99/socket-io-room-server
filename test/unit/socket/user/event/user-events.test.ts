import UsersDisconnectionHandler from "@server-room/user/event/user-disconnection-handler";
import ServerUser from "@server-room/user/server-user";
import ServerUserCreationHandler from "@server-room/user/server-user-creation-handler";
import { GenericObservable, IGenericObservable, IGenericObservableReader } from "@util/observable";
import { ServerConnectionFake } from '../../util/server-connection-fake'
import { IServerConnection } from "@server-room/server/types/server-connection";
import UsersRoomHandler from "@server-room/user/event/users-room-handler";
import { IServerRoomsManager } from "@server-room/room/types/server-rooms-manager";
import UserDataHandler from "@server-room/user/event/user-data-handler";
import ServerUserDataHandler from "@server-room/user/server-user-data-handler";

class ServerRoomsManagerFake implements IServerRoomsManager {
  createRoom = jest.fn();
  joinRoom = jest.fn();
  leaveRoom = jest.fn();
}

let serverUserCreationHandler: ServerUserCreationHandler;
let onUserConnectObservable: IGenericObservable<ServerUser>;

const roomName = "roomName";

jest.mock("socket.io");
jest.mock('@util/observable')

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
})

beforeEach(() => {
  onUserConnectObservable = new GenericObservable<ServerUser>();
  serverUserCreationHandler = {
    get onUserConnect() {
      return onUserConnectObservable as IGenericObservableReader<ServerUser>;
    }
  } as ServerUserCreationHandler;
})

function createUser() {
  const connection = new ServerConnectionFake() as IServerConnection;
  const dataHandler = {
    setData: jest.fn(),
    removeData: jest.fn()
  } as unknown as ServerUserDataHandler;

  return {
    get connection() { return connection },
    get dataHandler() { return dataHandler }
  } as ServerUser;
}

describe("UsersDisconnectionHandler", () => {

  beforeEach(() => {
    new UsersDisconnectionHandler(serverUserCreationHandler);
  })

  it("should UsersDisconnectionHandler constructor listen to new ServerUser", () => {
    expect(onUserConnectObservable.addListener).toBeCalledTimes(1);
  })

  it("should UsersDisconnectionHandler listen to server-disconnection", () => {
    const user = createUser();

    onUserConnectObservable.notify(user);

    expect(user.connection.on).toBeCalledWith("server-disconnection", expect.anything());
  })

  it("should UsersDisconnectionHandler call socket disconnect when server-disconnection event trigger", () => {
    const user = createUser();
    onUserConnectObservable.notify(user);
    user.connection["receive"]("server-disconnection");
    expect(user.connection.disconnect).toBeCalledTimes(1);
  })

})

describe("UsersRoomHandler", () => {

  let serverRoomManager: IServerRoomsManager;

  beforeEach(() => {
    serverRoomManager = new ServerRoomsManagerFake();
    new UsersRoomHandler(serverUserCreationHandler, serverRoomManager);
  })

  it("should UsersRoomHandler constructor listen to new ServerUser", () => {
    expect(onUserConnectObservable.addListener).toBeCalledTimes(1);
  })

  it("should UsersRoomHandler listen to create,join,leave room events", () => {
    const user = createUser();
    const mockedOn = user.connection.on as jest.MockedFn<() => void>;

    onUserConnectObservable.notify(user);

    const expectCreateRoom = ["createRoom", expect.anything()];
    const expectJoinRoom = ["joinRoom", expect.anything()];
    const expectLeaveRoom = ["leaveRoom", expect.anything()];

    expect(mockedOn.mock.calls.sort()).toStrictEqual([expectCreateRoom, expectJoinRoom, expectLeaveRoom]);
  })

  it("should call serverRoomManager.joinRoom when join event trigger", () => {
    const joinRoomCallback = jest.fn();
    const user = createUser();

    onUserConnectObservable.notify(user);
    user.connection["receive"]("joinRoom", roomName, joinRoomCallback);

    expect(serverRoomManager.joinRoom).toBeCalledWith(user, roomName, joinRoomCallback);
  })

  it("should call serverRoomManager.create when create event trigger", () => {
    const createRoomCallback = jest.fn();
    const user = createUser();

    onUserConnectObservable.notify(user);
    user.connection["receive"]("createRoom", roomName, createRoomCallback);

    expect(serverRoomManager.createRoom).toBeCalledWith(user, roomName, createRoomCallback);
  })

  it("should call serverRoomManager.leave when leave event trigger", () => {
    const leaveRoomCallback = jest.fn();
    const user = createUser();

    onUserConnectObservable.notify(user);
    user.connection["receive"]("leaveRoom", leaveRoomCallback);

    expect(serverRoomManager.leaveRoom).toBeCalledWith(user, leaveRoomCallback);
  })

})

describe("UserDataHandler", () => {

  beforeEach(() => {
    new UserDataHandler(serverUserCreationHandler);
  })

  it("should UserDataHandler constructor listen to new ServerUser", () => {
    expect(onUserConnectObservable.addListener).toBeCalledTimes(1);
  })

  it("should UserDataHandler listen to server-disconnection", () => {
    const user = createUser();
    const mockedOn = user.connection.on as jest.MockedFn<() => void>;

    onUserConnectObservable.notify(user);

    const expectSetData = ["setData", expect.anything()];
    const expectRemoveData = ["removeData", expect.anything()];

    expect(mockedOn.mock.calls.sort()).toStrictEqual([expectRemoveData, expectSetData]);
  })

  it("should UserDataHandler call setData to serverUser when setData event trigger", () => {
    const setDataCallback = jest.fn();
    const setData = {"name" : "user" , "score"  : 123};
    const user = createUser();

    onUserConnectObservable.notify(user);
    user.connection["receive"]("setData" , setData , setDataCallback);

    expect(user.dataHandler.setData).toBeCalledWith(setData);
    expect(setDataCallback).toBeCalledTimes(1);
  })

  it("should UserDataHandler call removeData to serverUser when removeData event trigger", () => {
    const removeDataCallback = jest.fn();
    const removeData = ["name" , "score"];
    const user = createUser();

    onUserConnectObservable.notify(user);
    user.connection["receive"]("removeData" , removeData , removeDataCallback);

    expect(user.dataHandler.removeData).toBeCalledWith(removeData);
    expect(removeDataCallback).toBeCalledTimes(1);
  })
})