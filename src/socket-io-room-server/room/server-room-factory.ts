import 'reflect-metadata'
import { injectable } from "inversify";
import ServerUser from "../user/server-user";
import { RoomDestroyCallback, IServerRoom } from "./types/server-room";
import { IServerRoomFactory } from "./types/server-room-factory";
import ServerRoom from './server-room';

@injectable()
export class ServerRoomFactory implements IServerRoomFactory {
    createRoom(owner: ServerUser, roomName: string, roomDestroyCallback: RoomDestroyCallback): IServerRoom {
        return new ServerRoom(owner , roomName , roomDestroyCallback);
    }
}