import SocketIOServer from "../../../src/socket-io-room-server/server/socket-io-server";
import { container } from "tsyringe";
import { instantiateServices } from "../../../src/app";
import { SocketTestUtility } from "./util/socket-test-utility";

describe("Socket Connection", () => {

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

    it('server check', async () => {
        await testUtility.createClient();
    });

    it('create room', async () => {
        const client1 = await testUtility.createClient();
        const creationResult = await client1.createRoom(roomName);
        
        expect(creationResult.success).toBeTruthy();
        expect(testUtility.checker.checkRoom(roomName)).toBeTruthy();
        expect(testUtility.checker.getRoomUserCount(roomName)).toEqual(1);
        expect(testUtility.checker.checkRoomClients(roomName , [client1])).toBeTruthy();
    });

    it('room join room check', async () => {
        const client1 = await testUtility.createClient();
        const client2 = await testUtility.createClient();
        
        await client1.createRoom(roomName);
        const result = await client2.joinRoom(roomName);
        
        expect(result.success).toBeTruthy();
        expect(testUtility.checker.getRoomUserCount(roomName)).toEqual(2);
        expect(testUtility.checker.checkRoomClients(roomName , [client1 , client2])).toBeTruthy();
    });

    it ('user disconnect' , async  () => {
        const client = await testUtility.createClient();

        await client.createRoom(roomName);
        await client.disconnect();
    });
    
    it('room leave room check', async () => {
        const client = await testUtility.createClient();

        await client.createRoom(roomName);
        const result = await client.leaveRoom();
        expect(result.success).toBeTruthy();
    });
    
    it('room leave room check 2', async () => {
        const [client1 , client2] = await testUtility.createRoom(roomName , 2);

        await client1.leaveRoom();
        expect(testUtility.checker.checkRoomClients(roomName , [client2])).toBeTruthy();
        
        const result = await client2.leaveRoom();
        expect(result.success).toBeTruthy();
        expect(testUtility.checker.checkRoom(roomName)).toBeFalsy();
    });

    it('room disconnection room check', async () => {
        const [client1 , client2, client3] = await testUtility.createRoom(roomName , 3);

        await Promise.all([client1.disconnect() , client3.leaveRoom()]);
        expect(testUtility.checker.checkRoomClients(roomName , [client2])).toBeTruthy();
        
        await client2.disconnect();
        expect(testUtility.checker.checkRoom(roomName)).toBeFalsy();
    });
    
    it('room with 8 users check', async () => {
        const clients = await testUtility.createRoom(roomName, 8);

        expect(testUtility.checker.getRoomUserCount(roomName)).toEqual(8);
        expect(testUtility.checker.checkRoomClients(roomName , clients)).toBeTruthy();
    });

    it ('join while already joined' , async () => {
        const client = await testUtility.createClient();

        await client.createRoom(roomName);
        const result = await client.joinRoom(roomName);
        expect(result.success).toBeFalsy();
    });

    it ('join non exist room' , async () => {
        const client = await testUtility.createClient();

        const result =await client.joinRoom(roomName);
        expect(result.success).toBeFalsy();
    });


    it ('create while already joined' , async () => { 
        const client = await testUtility.createClient();

        await client.createRoom(roomName);
        const result = await client.createRoom(roomName);
        expect(result.success).toBeFalsy();
    });

    it ('create exist room' , async () => { 
        const client1 = await testUtility.createClient();
        const client2 = await testUtility.createClient();

        await client1.createRoom(roomName);
        const result = await client2.createRoom(roomName);
        expect(result.success).toBeFalsy();
    });

    it ('leave while not joined' , async  () => {
        const client = await testUtility.createClient();

        let leaveResult = await client.leaveRoom();
        expect(leaveResult.success).toBeFalsy();

        const createResult = await client.createRoom(roomName);
        expect(createResult.success).toBeTruthy();

        leaveResult = await client.leaveRoom();
        expect(leaveResult.success).toBeTruthy();

        leaveResult = await client.leaveRoom();
        expect(leaveResult.success).toBeFalsy();
    });

    it ('join-leave then join non exist room' , async () => {
        
        const client = await testUtility.createClient();
        
        await client.createRoom(roomName);
        await client.leaveRoom();
        const result = await client.joinRoom(roomName);
        expect(result.success).toBeFalsy();
    });

    it ('join-leave then create exist room' , async () => {
        const client1 = await testUtility.createClient();
        const client2 = await testUtility.createClient();

        await client1.createRoom(roomName);
        await client1.leaveRoom();
        await client2.createRoom(roomName);
        
        const result = await client1.createRoom(roomName); 
        expect(result.success).toBeFalsy();

    })

    it ('multiple rooms' , async () => {
        
        let firstRoomClients = await testUtility.createRoom(roomName , 8);
        let secondRoomClient = await testUtility.createRoom(roomName2 , 8);

        expect(testUtility.checker.checkRoomClients(roomName , firstRoomClients)).toBeTruthy();
        expect(testUtility.checker.checkRoomClients(roomName2 , secondRoomClient)).toBeTruthy();

        //remove the (0,5) user from roomName
        await Promise.all([firstRoomClients[0].leaveRoom() , firstRoomClients[5].leaveRoom()]);
        firstRoomClients.splice(5,1);
        firstRoomClients.splice(0,1);
        expect(testUtility.checker.checkRoomClients(roomName , firstRoomClients)).toBeTruthy();
        expect(testUtility.checker.checkRoomClients(roomName2 , secondRoomClient)).toBeTruthy();

        //remove the (4,7) user from roomName2
        await Promise.all([secondRoomClient[4].leaveRoom() , secondRoomClient[7].leaveRoom()]);
        secondRoomClient.splice(7,1);
        secondRoomClient.splice(4,1);
        expect(testUtility.checker.checkRoomClients(roomName , firstRoomClients)).toBeTruthy();
        expect(testUtility.checker.checkRoomClients(roomName2 , secondRoomClient)).toBeTruthy();

        //remove all users from firstRoom
        await Promise.all(firstRoomClients.map(client => client.leaveRoom()));
        expect(testUtility.checker.checkRoom(roomName)).toBeFalsy();
        expect(testUtility.checker.checkRoomClients(roomName2 , secondRoomClient)).toBeTruthy();
    });

    //Normal disconnection check
});

