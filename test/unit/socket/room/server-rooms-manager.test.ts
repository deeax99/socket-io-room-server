import { RoomOperationsErrors } from "@server-room/dto/room-operations-errors";
import ServerOperationResult from "@server-room/dto/server-operation-result";
import ServerRoomsManager from "@server-room/room/server-rooms-manager";
import { IServerRoom } from "@server-room/room/types/server-room";
import { IServerRoomFactory } from "@server-room/room/types/server-room-factory";
import ServerUser from "@server-room/user/server-user";
import ServerUserConnectionStateHandler, { ServerUserConnectionState } from "@server-room/user/server-user-connection-state-handler";

const roomName = "roomName";

let serverRoomFactory: IServerRoomFactory;
let serverRoomManager: ServerRoomsManager;

function createServerRoomFactory() {
    return {
        createRoom: jest.fn(() => {
            return {
                joinUser: jest.fn(),
                leaveUser: jest.fn(),
            } as IServerRoom;
        })
    } as IServerRoomFactory;
}

function createServerUser(connectionState: ServerUserConnectionState) {
    const connectionStateHandler = new ServerUserConnectionStateHandler();
    connectionStateHandler["_state"] = connectionState;
    return {
        get connectionStateHandler() {
            return connectionStateHandler;
        },
    } as ServerUser;
}

beforeEach(() => {
    serverRoomFactory = createServerRoomFactory();
    serverRoomManager = new ServerRoomsManager(serverRoomFactory);
})

afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
})

describe("ServerRoomsManager", () => {

    let opCallback: jest.Mock;

    beforeEach(() => {
        opCallback = jest.fn();
    })

    function createUserAndRoomAndGetOwner() {
        const owner = createServerUser(ServerUserConnectionState.Connected);
        serverRoomManager.createRoom(owner, roomName, opCallback);
        owner.connectionStateHandler["_state"] = ServerUserConnectionState.InRoom;
        owner.connectionStateHandler["_roomName"] = roomName;
        return owner;
    }

    function createRoomAndGetUserAndMocked(): [ServerUser, jest.Mock, jest.Mock] {
        const owner = createUserAndRoomAndGetOwner();
        const room: IServerRoom = serverRoomManager["rooms"][roomName];
        return [owner, room.joinUser as jest.Mock, room.leaveUser as jest.Mock];
    }

    describe("create", () => {

        it("should create room in when user in connected state", () => {
            const serverUser = createUserAndRoomAndGetOwner();

            expect(opCallback).toBeCalledWith(ServerOperationResult.succeed());
            expect(serverRoomFactory.createRoom).toBeCalledWith(serverUser, roomName, expect.anything());
            expect(serverRoomManager["rooms"]).toHaveProperty(roomName);
        })

        it("should failed to create room when in any state other than connected state", () => {
            const inRoomServerUser = createServerUser(ServerUserConnectionState.InRoom);
            serverRoomManager.createRoom(inRoomServerUser, roomName, opCallback);

            expect(opCallback).toBeCalledWith(ServerOperationResult.failed(RoomOperationsErrors.UserInJoinedState));
            expect(serverRoomFactory.createRoom).toBeCalledTimes(0);
            expect(serverRoomManager["rooms"]).not.toHaveProperty(roomName);
        })

        it("should failed to create exist Room", () => {
            createUserAndRoomAndGetOwner();
            const serverUser2 = createServerUser(ServerUserConnectionState.InRoom);

            serverRoomManager.createRoom(serverUser2, roomName, opCallback);

            expect(opCallback).nthCalledWith(2, ServerOperationResult.failed(RoomOperationsErrors.RoomExist));
        })
    })

    describe("join", () => {
        it("should join room when user in connected state", () => {
            const [, mockedJoin] = createRoomAndGetUserAndMocked();
            const serverUser = createServerUser(ServerUserConnectionState.Connected);
            serverRoomManager.joinRoom(serverUser, roomName, opCallback);

            const joinCallback = mockedJoin.mock.calls[0][1];
            joinCallback("data");

            expect(opCallback).nthCalledWith(2, ServerOperationResult.succeed("data"));
        })

        it("should failed to join non exist room", () => {
            const serverUser = createServerUser(ServerUserConnectionState.Connected);
            serverRoomManager.joinRoom(serverUser, roomName, opCallback);
            expect(opCallback).nthCalledWith(1, ServerOperationResult.failed(RoomOperationsErrors.RoomNotExist));
        })

        it("should failed to join while already joined", () => {
            const owner = createUserAndRoomAndGetOwner();
            serverRoomManager.joinRoom(owner, roomName, opCallback);
            expect(opCallback).nthCalledWith(2, ServerOperationResult.failed(RoomOperationsErrors.UserInJoinedState));
        })
    })

    describe("leave", () => {

        function getRoomDestroyCallback() {
            const createRoomMock = serverRoomFactory.createRoom as jest.Mock;
            return createRoomMock.mock.calls[0][2];
        }

        it("should leave room when user inside the room and destroy the room", () => {
            const [serverUser, , leaveMock] = createRoomAndGetUserAndMocked();
            serverRoomManager.leaveRoom(serverUser, opCallback);

            const roomDestroyCallback = getRoomDestroyCallback();
            const mockCallback = leaveMock.mock.calls[0][1];
            mockCallback();
            roomDestroyCallback();

            expect(opCallback).nthCalledWith(2, ServerOperationResult.succeed());
            expect(serverRoomManager).not.toHaveProperty(roomName);
        })

        it("should failed to leave room when user isn't in room state", () => {
            const serverUser = createServerUser(ServerUserConnectionState.Connected);
            serverRoomManager.leaveRoom(serverUser, opCallback);
            expect(opCallback).toBeCalledWith(ServerOperationResult.failed(RoomOperationsErrors.UserNotInJoinedState));
        })
    })
})