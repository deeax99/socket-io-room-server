import "reflect-metadata"
import { Container, injectable } from "inversify";
import ServerRoomsManager from "../../../../src/socket-io-room-server/room/server-rooms-manager";
import { IServerRoom, JoinUserCallback, LeaveUserCallback, RoomDestroyCallback, SERVER_ROOMS_FACTORY_SYMBOL } from "../../../../src/socket-io-room-server/room/types/server-room";
import { SERVER_ROOMS_MANAGER_SYMBOL } from "../../../../src/socket-io-room-server/room/types/server-rooms-manager";
import { ServerConnectionFake } from "../util/server-connection-fake";
import ServerUser from "../../../../src/socket-io-room-server/user/server-user";
import ServerOperationResult from "../../../../src/socket-io-room-server/dto/server-operation-result";
import { RoomChangeDto } from "../../../../src/socket-io-room-server/dto/room-change.dto";
import { IServerRoomFactory } from "../../../../src/socket-io-room-server/room/types/server-room-factory";

enum RoomOpErrors {
    RoomNotExist = "Room not exist",
    RoomExist = "Room exist",
    UserInJoinedState = "User already in joined state",
    UserNotInJoinedState = "User already in connected state"
}

class ServerRoomFake implements IServerRoom {

    constructor(private owner: ServerUser, private roomName: string, private roomDestroyCallback: RoomDestroyCallback) {
        this.joinUser(owner, undefined);
    }

    joinUser = jest.fn((user: ServerUser, callback: JoinUserCallback) => {
        user.connectionStateHandler.joinRoom(this.roomName);
        if (callback != undefined) {
            callback({ "roomName": this.roomName } as RoomChangeDto);
        }
    });

    leaveUser = jest.fn((user: ServerUser, callback: LeaveUserCallback) => {
        user.connectionStateHandler.leaveRoom();
        callback();
    });

    destroyRoom() {
        this.roomDestroyCallback();
    }
}

@injectable()
class ServerRoomFactoryFake implements IServerRoomFactory {
    createRoom = jest.fn((owner: ServerUser, roomName: string, roomDestroyCallback: RoomDestroyCallback) => {
        return new ServerRoomFake(owner, roomName, roomDestroyCallback);
    });
}

describe("ServerRoomsManager", () => {

    const roomName = "room_1";
    const roomName2 = "room_2";

    let serverRoomsManager: ServerRoomsManager;
    let roomFactory: ServerRoomFactoryFake;
    let serverUser: ServerUser;
    let serverUser2: ServerUser;

    function createServerUser() {
        const connection = new ServerConnectionFake();
        return new ServerUser(connection);
    }


    beforeEach(() => {
        const container = new Container();

        container.bind<IServerRoomFactory>(SERVER_ROOMS_FACTORY_SYMBOL).to(ServerRoomFactoryFake).inSingletonScope();
        container.bind<ServerRoomsManager>(SERVER_ROOMS_MANAGER_SYMBOL).to(ServerRoomsManager).inSingletonScope();

        serverRoomsManager = container.get<ServerRoomsManager>(SERVER_ROOMS_MANAGER_SYMBOL);
        roomFactory = container.get<IServerRoomFactory>(SERVER_ROOMS_FACTORY_SYMBOL) as ServerRoomFactoryFake;

        serverUser = createServerUser();
        serverUser2 = createServerUser();
    })

    it("should create room", () => {
        const createRoomFn = jest.fn();

        serverRoomsManager.createRoom(serverUser, roomName, createRoomFn);
        serverRoomsManager.createRoom(serverUser, roomName2, createRoomFn);
        serverRoomsManager.createRoom(serverUser2, roomName, createRoomFn);
        serverRoomsManager.createRoom(serverUser2, roomName2, createRoomFn);

        expect(createRoomFn.mock.calls).toHaveLength(4);
        expect(createRoomFn.mock.calls).toStrictEqual([
            [ServerOperationResult.succeed()],
            [ServerOperationResult.failed(RoomOpErrors.UserInJoinedState)],
            [ServerOperationResult.failed(RoomOpErrors.RoomExist)],
            [ServerOperationResult.succeed()],
        ]);

        const rooms = serverRoomsManager["rooms"];

        expect(Object.keys(rooms)).toHaveLength(2);
        expect(rooms[roomName]).toBe(roomFactory.createRoom.mock.results[0].value);
        expect(rooms[roomName2]).toBe(roomFactory.createRoom.mock.results[1].value);
    })

    it("should join room", () => {
        const joinRoomFn = jest.fn();

        const room = roomFactory.createRoom(serverUser2, roomName, undefined);
        serverRoomsManager["rooms"][roomName] = room;

        serverRoomsManager.joinRoom(serverUser, roomName2, joinRoomFn);
        serverRoomsManager.joinRoom(serverUser, roomName, joinRoomFn);
        serverRoomsManager.joinRoom(serverUser, roomName, joinRoomFn);

        expect(joinRoomFn.mock.calls).toHaveLength(3);
        expect(joinRoomFn.mock.calls).toStrictEqual([
            [ServerOperationResult.failed(RoomOpErrors.RoomNotExist)],
            [ServerOperationResult.succeed({ "roomName": roomName })],
            [ServerOperationResult.failed(RoomOpErrors.UserInJoinedState)],
        ]);
    })

    it("should leave room", () => {
        const leaveRoomFn = jest.fn();

        serverRoomsManager.createRoom(serverUser, roomName, jest.fn());
        serverRoomsManager.leaveRoom(serverUser, leaveRoomFn);
        serverRoomsManager.leaveRoom(serverUser2, leaveRoomFn);

        expect(leaveRoomFn.mock.calls).toHaveLength(2);
        expect(leaveRoomFn.mock.calls).toStrictEqual([
            [ServerOperationResult.succeed()],
            [ServerOperationResult.failed(RoomOpErrors.UserNotInJoinedState)],
        ]);

        const room = serverRoomsManager["rooms"][roomName] as ServerRoomFake;
        room.destroyRoom();

        expect(Object.keys(serverRoomsManager["rooms"])).toHaveLength(0);
    })
})