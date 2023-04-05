import ServerUser from "../../user/server-user";
import { IServerRoom, RoomDestroyCallback } from "./server-room";

export interface IServerRoomFactory {
    createRoom(owner: ServerUser, roomName: string, roomDestroyCallback: RoomDestroyCallback): IServerRoom;
}
