import { container } from "tsyringe";
import ClientUserConnection from "./client-user-connection";
import ServerRoomsHandler from "../../../../src/socket-io-room-server/room/server-rooms-handler";
import ServerRoom from "../../../../src/socket-io-room-server/room/server-room";
import ServerUser from "../../../../src/socket-io-room-server/user/server-user";
import { SocketCheckUtility } from "./socket-check-utility";
import ServerUsersHandler from "../../../../src/socket-io-room-server/user/server-users-handler";

export type Rooms = { [id: string]: ServerRoom };

export class SocketTestUtility {

    public static port: number = 5656;
    private static url: string = "http://localhost:5656";
    private socketCheckUtility: SocketCheckUtility;
    private serverUsers:ServerUser[] = [];
    constructor() {
        this.socketCheckUtility = new SocketCheckUtility(this);
    }

    public get checker(): SocketCheckUtility {
        return this.socketCheckUtility;
    }

    listenToUser()  {
        this.serverUsers = [];
        const addUser = (userConnection:ServerUser) => {
            this.serverUsers.push(userConnection);
        };
        
        const usersHandler = container.resolve(ServerUsersHandler); 
        usersHandler.onUserConnect.addListener(addUser);
    }

    createClient = async (): Promise<ClientUserConnection> => {
        const clientSocket = new ClientUserConnection(SocketTestUtility.url);
        await clientSocket.connect();

        return clientSocket;
    };

    getRooms(): Rooms {
        const roomsHandler = container.resolve(ServerRoomsHandler);
        const rooms = roomsHandler["rooms"];
        return rooms;
    }
    getRoomUsers(room: ServerRoom): ServerUser[] {
        return room["users"];
    }
    getRoom(roomName: string): ServerRoom {
        const rooms = this.getRooms();
        return rooms[roomName];
    }

    async createRoom(roomName: string, userCount: number): Promise<ClientUserConnection[]> {
        if (userCount <= 0)
            return [];

        const result: ClientUserConnection[] = [];
        const owner = await this.createClient();

        const createResult = await owner.createRoom(roomName);

        if (createResult.success == false)
            return [];

        const nullArr = [];
        for (let i = 1; i < userCount; i++) {
            nullArr.push(null);
        }

        const clients = await Promise.all(nullArr.map(_ => this.createClient()));
        await Promise.all(clients.map(client => client.joinRoom(roomName)));

        return [owner, ...clients];
    }

    getServerUsers () : ServerUser[] {
        return this.serverUsers;
    }
    getServerUser(userId:string) : ServerUser {
        
        for(var i = 0 ; i < this.serverUsers.length ; i++) {
            const serverUser = this.serverUsers[i];
            if (serverUser.id == userId) {
                return serverUser;
            }
        }
        
        return undefined;
    }
    getUserData (userId:string) {
        const serverUser = this.getServerUser(userId);
        return serverUser.dataHandler.getData();
    }
}
