import ServerOperationResult from '../../dto/server-operation-result';
import ServerUser from '../../user/server-user';

export const SERVER_ROOMS_MANAGER_SYMBOL = Symbol('ServerRoomHandler');
export type ServerOperationCallbackType = (op: ServerOperationResult) => void;

export interface IServerRoomsManager {
	joinRoom(user: ServerUser, roomName: string, callback: ServerOperationCallbackType);
	createRoom(owner: ServerUser, roomName: string, callback: ServerOperationCallbackType);
	leaveRoom(user: ServerUser, callback: ServerOperationCallbackType);
}
