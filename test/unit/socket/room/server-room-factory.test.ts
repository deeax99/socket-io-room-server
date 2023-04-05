import ServerRoom from "@server-room/room/server-room";
import { ServerRoomFactory } from "@server-room/room/server-room-factory";
import ServerUser from "@server-room/user/server-user";
jest.mock("@server-room/room/server-room");

describe("ServerRoomFactory", () => {

    let serverRoomFactory: ServerRoomFactory;

    beforeEach(() => {
        serverRoomFactory = new ServerRoomFactory();
    })

    it("should create server room", () => {
        const mockedServerRoom = ServerRoom as  jest.MockedClass<typeof ServerRoom>;
        
        const user = {} as ServerUser;
        const roomName = "room_1";
        const roomDestroyCallback = jest.fn();

        const result = serverRoomFactory.createRoom(user, roomName, roomDestroyCallback);
        
        expect(result).not.toBeNull();
        expect(mockedServerRoom).toHaveBeenNthCalledWith(1 , user ,roomName , roomDestroyCallback);
    })
})