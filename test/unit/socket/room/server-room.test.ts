import ServerRoomEvent from "../../../../src/socket-io-room-server/room/room-util/server-room-event";
import ServerRoom from "../../../../src/socket-io-room-server/room/server-room"
import { RoomDestroyCallback } from "../../../../src/socket-io-room-server/room/types/server-room";
import ServerUser from "../../../../src/socket-io-room-server/user/server-user";
import { ServerConnectionFake } from "../util/server-connection-fake";

jest.mock("../../../../src/socket-io-room-server/room/room-util/server-room-event", () => {
    const originalModule = jest.requireActual('../../../../src/socket-io-room-server/room/room-util/server-room-event');

    const mockedConstructor = jest.fn(() => {

        const instance = new originalModule.default();
        const mock = (prop: string) => {
            instance[prop]._notify = instance[prop].notify
            instance[prop].notify = jest.fn(instance[prop]._notify);
        }

        mock("onUserJoin");
        mock("onUserDisconnect");
        mock("onUserLeave");

        return instance;
    });
    return {
        __esModule: true,
        ...originalModule,
        default: mockedConstructor,
    };

});

let serverRoom: ServerRoom;
let serverUser: ServerUser;
let serverUser2: ServerUser;
let roomDestroyCallback: jest.Mock;

const roomName = "room_1";

function createRoom(owner: ServerUser, roomName: string, roomDestroyCallback: RoomDestroyCallback) {
    return new ServerRoom(owner, roomName, roomDestroyCallback);
}
function createRoomAndAssign() {
    serverRoom = createRoom(serverUser, roomName, roomDestroyCallback);
}

beforeEach(() => {
    roomDestroyCallback = jest.fn();
    serverUser = createServerUser();
    serverUser2 = createServerUser();
})

function createServerUser() {
    const connection = new ServerConnectionFake();
    return new ServerUser(connection);
}


describe("ServerRoom", () => {
    it("should roomData CRUD room data", () => {

        createRoomAndAssign();

        const roomData = serverRoom["roomData"];

        expect(roomData["owner"]).toBe(serverUser);
        expect(roomData["roomName"]).toBe(roomName);
        expect(roomData["users"]).toStrictEqual([serverUser]);

        roomData.addUser(serverUser2);
        roomData.updateOwner();

        expect(roomData["owner"]).toBe(serverUser);
        expect(roomData["users"]).toStrictEqual([serverUser, serverUser2]);

        roomData.removeUser(serverUser);
        roomData.updateOwner();

        expect(roomData["owner"]).toBe(serverUser2);
        expect(roomData["users"]).toStrictEqual([serverUser2]);

        roomData.triggerDestroyCallback();
        expect(roomDestroyCallback.mock.calls).toHaveLength(1);
    })

    it("should trigger onUserJoin/onUserLeave/onDisconnect", () => {

        createRoomAndAssign();

        const roomEvent = serverRoom["roomEvent"];

        const onJoinFn = roomEvent.onUserJoin.notify as unknown as jest.Mock;
        const onLeaveFn = roomEvent.onUserLeave.notify as unknown as jest.Mock;
        const onDisconnectFn = roomEvent.onUserDisconnect.notify as unknown as jest.Mock;

        serverRoom.joinUser(serverUser2, jest.fn());
        serverRoom.leaveUser(serverUser, jest.fn());
        serverUser2.connection.disconnect();

        expect(onJoinFn.mock.calls).toHaveLength(2);

        expect(onJoinFn.mock.calls[0][0]).toBe(serverUser);
        expect(onJoinFn.mock.calls[1][0]).toBe(serverUser2);

        expect(onLeaveFn.mock.calls).toHaveLength(1);
        expect(onLeaveFn.mock.lastCall[0]).toBe(serverUser);

        expect(onDisconnectFn.mock.lastCall[0]).toBe(serverUser2);
        expect(onDisconnectFn.mock.calls).toHaveLength(1);
    })
})