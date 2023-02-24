import SocketIOServer from "../../../src/socket-io-room-server/server/socket-io-server";
import { container } from "tsyringe";
import { instantiateServices } from "../../../src/app";
import { SocketTestUtility } from "./util/socket-test-utility";

describe("Room User Data", () => {

    let testUtility: SocketTestUtility = null;
    let server: SocketIOServer = null;

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
        testUtility.listenToUser();
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

    it('set user data', async () => {

        const data = new Map<string, any>([
            ["nickname", "cooluser"],
            ["userID", "12345678"]]);

        const client = await testUtility.createClient();
        await client.setData(data);

        expect(testUtility.checker.checkUserServerData(client.id, data)).toBeTruthy();
    });

    it('set user data checker', async () => {

        const setData = new Map<string, any>([
            ["nickname", "cooluser"],
            ["userID", "12345678"]]);

        const test1 = new Map<string, any>([
            ["nickname", "notcooluser"],
            ["userID", "0000"]]);

        const test2 = new Map<string, any>([
            ["nicknamex", "notcooluser"],
            ["userIDt", "0000"]]);

        const test3 = new Map<string, any>([
            ["nickname", "notcooluser"]]);

        const client = await testUtility.createClient();
        await client.setData(setData);

        expect(testUtility.checker.checkUserServerData(client.id, test1)).toBeFalsy();
        expect(testUtility.checker.checkUserServerData(client.id, test2)).toBeFalsy();
        expect(testUtility.checker.checkUserServerData(client.id, test3)).toBeFalsy();
    });

    it('mulitple set data', async () => {
        const data = new Map<string, any>([
            ["nickname", "cooluser"],
            ["userID", "12345678"]]);
        const data2 = new Map<string, any>([["nickname", "supercooluser"]]);
        const dataChecker = new Map<string, any>([
            ["nickname", "supercooluser"],
            ["userID", "12345678"]]);

        const client = await testUtility.createClient();
        await client.setData(data);
        await client.setData(data2);
        expect(testUtility.checker.checkUserServerData(client.id, dataChecker)).toBeTruthy();
    });

    it('remove user data', async () => {

        const data = new Map<string, any>([
            ["nickname", "cooluser"],
            ["userID", "12345678"]]);
        
        const dataChecker = new Map<string,any>([
            ["nickname", "cooluser"],
        ]);
        
        const removeKeys = ["userID"];
        const client = await testUtility.createClient();
        await client.setData(data);
        await client.removeData(removeKeys);

        expect(testUtility.checker.checkUserServerData(client.id, dataChecker)).toBeTruthy();
    });

});

