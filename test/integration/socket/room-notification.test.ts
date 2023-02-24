import SocketIOServer from "../../../src/socket-io-room-server/server/socket-io-server";
import { container } from "tsyringe";
import ServerRoom from "../../../src/socket-io-room-server/room/server-room";
import { instantiateServices } from "../../../src/app";
import { SocketTestUtility } from "./util/socket-test-utility";
import { RoomChangeDto } from "../../../src/socket-io-room-server/room/dto/room-change.dto";

describe("Room User Data", () => {

    let testUtility: SocketTestUtility = null;
    let server:SocketIOServer = null;

    const roomName = "testing_room_1";
    const roomName2 = "testing_room_2";
    
    beforeAll(() => {
        server = new SocketIOServer();
        server.listen(SocketTestUtility.port);
        testUtility = new SocketTestUtility();
    });
    beforeEach(() => {
        const continerServer = container.resolve(SocketIOServer);
        continerServer["io"] = server["io"];
        instantiateServices();
    })
    afterEach(() => {
        container.clearInstances();
        const serverIO = server["io"];
        serverIO.disconnectSockets();
        serverIO.removeAllListeners();
    })
    afterAll(() => {
        if (server != null)
            server.close();
    });

    it('room join result', async () => {
        const client = await testUtility.createClient();
        const client2 = await testUtility.createClient();
        
        await client.createRoom(roomName);
        const joinResult = await client2.joinRoom(roomName);
        const expectedChange:RoomChangeDto = {
            newOwnerId:client.id,
            joinedUser:[
                {
                    data : {},
                    id:client.id,
                    state : {}
                }
            ]
        };
        
        expect(joinResult.data).toStrictEqual(expectedChange);
    });
});

