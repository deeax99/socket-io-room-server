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

/*
describe("" , () => {
  it ("" , () => {

  })
})

import { Container } from 'inversify';
import UsersDisconnectionHandler, { USER_DISCONNECTION_HANDLER_SYMBOL } from '../../../../../src/socket-io-room-server/user/event/user-disconnection-handler';
import { ServerConnectionFake } from '../../util/server-connection-fake';
import ServerTestHelper from '../../util/server-test-helper';
import UsersRoomHandler, { USER_ROOM_HANDLER_SYMBOL } from '../../../../../src/socket-io-room-server/user/event/users-room-handler';
import { IServerRoomsManager, SERVER_ROOMS_MANAGER_SYMBOL } from '../../../../../src/socket-io-room-server/room/types/server-rooms-manager';
import UserDataHandler, { USER_DATA_HANDLER_SYMBOL } from '../../../../../src/socket-io-room-server/user/event/user-data-handler';
import ServerUser from '../../../../../src/socket-io-room-server/user/server-user';
import ServerUserCreationHandler from '@server-room/user/server-user-creation-handler';
import { GenericObservable, IGenericObservableReader } from '@util/observable';

let container: Container;
let serverConnectionFaker: ServerConnectionFake;
let serverTestHelper: ServerTestHelper;
let serverUserCreationHandler:ServerUserCreationHandler;

function createServerUserCreationHandler() {
  serverUserCreationHandler = {
    "_onUserConnect" : new GenericObservable<ServerUser>(),
    "onUserConnect" : jest.fn(() => serverUserCreationHandler["_onUserConnect"])
  } as unknown as ServerUserCreationHandler
}
beforeEach(() => {
  createServerUserCreationHandler();
});

describe('UsersDisconnectionHandler', () => {
  beforeEach(() => {
    container.bind<UsersDisconnectionHandler>(USER_DISCONNECTION_HANDLER_SYMBOL).to(UsersDisconnectionHandler).inSingletonScope();
  });

  it('should usersDisconnectionHandler call disconnect when event is trigger', () => {
    const disconnectionEvent = jest.fn();

    container.get<UsersDisconnectionHandler>(USER_DISCONNECTION_HANDLER_SYMBOL);
    serverConnectionFaker.addDisconnectionListener(disconnectionEvent);
    serverTestHelper.triggerConnection(serverConnectionFaker);

    expect(serverConnectionFaker['onEvents']).toHaveProperty('server-disconnection');
    expect(disconnectionEvent.mock.calls).toHaveLength(0);

    serverConnectionFaker.receive('server-disconnection');
    expect(disconnectionEvent.mock.calls).toHaveLength(1);
  });
});

describe('UsersRoomHandler', () => {
  const roomName = 'testRoom';

  beforeEach(() => {
    container.bind<UsersRoomHandler>(USER_ROOM_HANDLER_SYMBOL).to(UsersRoomHandler).inSingletonScope();
  });

  function setupOperation(opName: string, serverRoomOpFn: jest.Mock) {
    const serverRoomManager = {} as IServerRoomsManager;
    serverRoomManager[opName] = serverRoomOpFn;
    container.bind<IServerRoomsManager>(SERVER_ROOMS_MANAGER_SYMBOL).toConstantValue(serverRoomManager);

    container.get<UsersRoomHandler>(USER_ROOM_HANDLER_SYMBOL);

    serverTestHelper.triggerConnection(serverConnectionFaker);
    expect(serverConnectionFaker['onEvents']).toHaveProperty(opName);
  }

  function testEnterRoom(opName: string) {

    const opResult = {"result" : true};
    const serverRoomOpFn = jest.fn((connection, roomName, callback) => callback(opResult));

    setupOperation(opName, serverRoomOpFn);

    const opCallbackFn = jest.fn();
    serverConnectionFaker.receive(opName, roomName, opCallbackFn);

    expect(serverRoomOpFn.mock.calls).toHaveLength(1);

    expect(serverRoomOpFn.mock.calls[0][0]['connection']).toBe(serverConnectionFaker);
    expect(serverRoomOpFn.mock.calls[0][1]).toBe(roomName);
    expect(serverRoomOpFn.mock.calls[0][2]).toBe(opCallbackFn);

    expect(opCallbackFn.mock.calls).toHaveLength(1);
    expect(opCallbackFn.mock.lastCall[0]).toStrictEqual(opResult);
  }

  function testLeaveRoom(opName: string) {

    const serverRoomOpFn = jest.fn((connection, callback) => callback());

    setupOperation(opName, serverRoomOpFn);

    const opCallbackFn = jest.fn();
    serverConnectionFaker.receive(opName, opCallbackFn);

    expect(serverRoomOpFn.mock.calls).toHaveLength(1);
    expect(serverRoomOpFn.mock.calls[0][0]['connection']).toBe(serverConnectionFaker);
    expect(serverRoomOpFn.mock.calls[0][1]).toBe(opCallbackFn);

    expect(opCallbackFn.mock.calls).toHaveLength(1);
  }

  it('should create room', () => {
    testEnterRoom('createRoom');
  });

  it('should join room', () => {
    testEnterRoom('joinRoom');
  });

  it('should leave room', () => {
    testLeaveRoom('leaveRoom');
  });
});

describe('UserDataHandler', () => {
  beforeEach(() => {
    container.bind<UserDataHandler>(USER_DATA_HANDLER_SYMBOL).to(UserDataHandler).inSingletonScope();
  });

  it('should userDataHandler call setData and removeData', () => {
    const setDataFn = jest.fn();
    const removeDataFn = jest.fn();
    const callbackFn = jest.fn();

    container.get<UserDataHandler>(USER_DATA_HANDLER_SYMBOL);

    const serverUser = new ServerUser(serverConnectionFaker);
    serverTestHelper.triggerUser(serverUser);

    expect(serverConnectionFaker['onEvents']).toHaveProperty('setData');
    expect(serverConnectionFaker['onEvents']).toHaveProperty('removeData');

    serverUser.dataHandler.setData = setDataFn;
    serverUser.dataHandler.removeData = removeDataFn;

    const setDataObject = { name: '4' };
    const removeDataKeys = ['name'];

    serverConnectionFaker.receive('setData', { name: '4' }, callbackFn);
    expect(setDataFn.mock.calls).toHaveLength(1);
    expect(callbackFn.mock.calls).toHaveLength(1);
    expect(setDataFn.mock.lastCall[0]).toStrictEqual(setDataObject);

    serverConnectionFaker.receive('removeData', ['name'], callbackFn);
    expect(removeDataFn.mock.calls).toHaveLength(1);
    expect(callbackFn.mock.calls).toHaveLength(2);
    expect(removeDataFn.mock.lastCall[0]).toStrictEqual(removeDataKeys);
  });
});
*/
