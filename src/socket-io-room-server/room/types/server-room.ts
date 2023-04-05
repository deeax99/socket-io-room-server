import ServerUser from '../../user/server-user';
import { RoomChangeDto } from '../../dto/room-change.dto';

export const SERVER_ROOMS_FACTORY_SYMBOL = Symbol('ServerRoomFactory');

export type RoomDestroyCallback = () => void;

export type JoinUserCallback = (dto: RoomChangeDto) => void | undefined;
export type LeaveUserCallback = () => void;

export interface IServerRoom {
    joinUser(user: ServerUser, callback: JoinUserCallback);
    leaveUser(user: ServerUser, callback: LeaveUserCallback);
}

