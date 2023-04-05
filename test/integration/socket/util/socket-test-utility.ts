import {container} from 'tsyringe';
import ClientUserConnection from '../client/client-user-connection';
import ServerRoomsManager from '../../../../src/socket-io-room-server/room/server-rooms-manager';
import ServerRoom from '../../../../src/socket-io-room-server/room/server-room';
import ServerUser from '../../../../src/socket-io-room-server/user/server-user';
import {SocketCheckUtility} from './socket-check-utility';
import ServerUserCreationHandler from '../../../../src/socket-io-room-server/user/server-user-creation-handler';

export type Rooms = { [id: string]: ServerRoom };

export class SocketTestUtility {
  public static port = 5656;
  private static url = 'http://localhost:5656';
  private socketCheckUtility: SocketCheckUtility;
  private serverUsers:ServerUser[] = [];
  constructor() {
    this.socketCheckUtility = new SocketCheckUtility(this);
  }

  public get checker(): SocketCheckUtility {
    return this.socketCheckUtility;
  }

  listenToUser() {
    this.serverUsers = [];
    const addUser = (userConnection:ServerUser) => {
      this.serverUsers.push(userConnection);
    };

    const usersHandler = container.resolve(ServerUserCreationHandler);
    usersHandler.onUserConnect.addListener(addUser);
  }

  createClient = async (): Promise<ClientUserConnection> => {
    const clientSocket = new ClientUserConnection();
    await clientSocket.connect(SocketTestUtility.url);

    return clientSocket;
  };

  getRooms(): Rooms {
    const roomsHandler = container.resolve(ServerRoomsManager);
    const rooms = roomsHandler['rooms'];
    return rooms;
  }
  getRoomUsers(room: ServerRoom): ServerUser[] {
    return room['roomData']['users'];
  }
  getRoom(roomName: string): ServerRoom {
    const rooms = this.getRooms();
    return rooms[roomName];
  }

  async createRoom(roomName: string, userCount: number): Promise<ClientUserConnection[]> {
    if (userCount <= 0) {
      return [];
    }

    const result: ClientUserConnection[] = [];
    const owner = await this.createClient();

    const createResult = await owner.createRoom(roomName);

    if (createResult.success == false) {
      return [];
    }

    const nullArr = [];
    for (let i = 1; i < userCount; i++) {
      nullArr.push(null);
    }

    const clients = await Promise.all(nullArr.map((_) => this.createClient()));
    await Promise.all(clients.map((client) => client.joinRoom(roomName)));

    return [owner, ...clients];
  }

  getServerUsers() : ServerUser[] {
    return this.serverUsers;
  }
  getServerUser(userId:string) : ServerUser {
    for (let i = 0; i < this.serverUsers.length; i++) {
      const serverUser = this.serverUsers[i];
      if (serverUser.id == userId) {
        return serverUser;
      }
    }

    return undefined;
  }
  getUserData(userId:string) {
    const serverUser = this.getServerUser(userId);
    return serverUser.dataHandler.getData();
  }
}
