import { KeyValueData } from "../../../../src/socket-io-room-server/room/dto/data-key-value-change";
import ClientUserConnection from "./client-user-connection";
import { SocketTestUtility } from "./socket-test-utility";

export class SocketCheckUtility {

    constructor(private socketTestUtility: SocketTestUtility) { }
    checkRoom(roomName) {
        const rooms = this.socketTestUtility.getRooms();
        return roomName in rooms;
    }
    getRoomUserCount(roomName) {
        const room = this.socketTestUtility.getRoom(roomName);
        const users = this.socketTestUtility.getRoomUsers(room);
        return users.length;
    }

    checkRoomClients(roomName: string, clientConnections: ClientUserConnection[]) {
        const room = this.socketTestUtility.getRoom(roomName);
        const users = this.socketTestUtility.getRoomUsers(room);

        const lhs = clientConnections.map(clientConnection => clientConnection.id);
        const rhs = users.map(user => user.id);

        return this.arraysEqual(lhs, rhs);
    }

    checkUserServerData(userId:string, expectedData: KeyValueData) {
        const data = this.socketTestUtility.getUserData(userId);
        const res = this.isDeepEqual(data,expectedData);
        return res;
    }


    private isDeepEqual(object1, object2) {
        const objKeys1 = Object.keys(object1);
        const objKeys2 = Object.keys(object2);
        
        if (objKeys1.length !== objKeys2.length) return false;

        for (var key of objKeys1) {
            const value1 = object1[key];
            const value2 = object2[key];

            const isObjects = this.isObject(value1) && this.isObject(value2);

            if ((isObjects && !this.isDeepEqual(value1, value2)) ||
                (!isObjects && value1 !== value2)) {
                return false;
            }
        }
        return true;
    };

    private isObject(object) {
        return object != null && typeof object === "object";
    };


    private arraysEqual(a: any[], b: any[], withOrder: boolean = true): boolean {

        if (a === b)
            return true;
        if (a == null || b == null)
            return false;
        if (a.length !== b.length)
            return false;

        if (!withOrder) {
            a.sort();
            b.sort();
        }
        for (var i = 0; i < a.length; ++i) {
            if (a[i] !== b[i])
                return false;
        }

        return true;
    }
}
