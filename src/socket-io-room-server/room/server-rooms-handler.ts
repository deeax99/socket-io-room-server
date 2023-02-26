import ServerRoom from "./server-room";
import ServerUser from "../user/server-user";
import { injectable, singleton } from "tsyringe";
import ServerOperationResult from "../operation/server-operation-result";
import { ServerUserConnectionState } from "../user/server-user-connection-state-handler";
import { RoomChangeDto } from "./dto/room-change.dto";

type Rooms =  { [id: string]: ServerRoom };
type CallbackType = (op:ServerOperationResult) => void;

@singleton()
export default class ServerRoomsHandler {
	private rooms:Rooms = {};

	constructor(){}

	joinRoom(user: ServerUser, roomName: string , callback:CallbackType) { 
		if (!this.isRoomExist(roomName)) {
			callback(ErrorReturn.RoomNotExistError())
		}
		else if (user.connectionState.state != ServerUserConnectionState.Connected) {
			callback(ErrorReturn.UserAlreadyJoinedError())
		}
		//check if room full
		else {
			const result = this.joinRoomUnsafe(user, roomName , callback);
		}
	}

	createRoom(owner: ServerUser, roomName: string , callback:CallbackType){
		if (this.isRoomExist(roomName)) {
			callback(ErrorReturn.RoomExistError());
		}
		else if (owner.connectionState.state != ServerUserConnectionState.Connected) {
			callback(ErrorReturn.UserAlreadyJoinedError());
		}
		else {
			const result = this.createRoomUnsafe(owner , roomName);
			callback(ServerOperationResult.Successed());
		}
	}

	leaveRoom(user: ServerUser , callback:CallbackType) {
		
		const roomName = user.connectionState.roomName;
		const room = this.rooms[roomName];
		if (user.connectionState.state != ServerUserConnectionState.InRoom) {
			callback(ErrorReturn.UserNotInRoom());
		}
		else {
			room.leaveUser(user , () => callback(ServerOperationResult.Successed()));
		}
	}

	removeRoom(roomName: string) {
		delete this.rooms[roomName];
	}

	private isRoomExist(roomName: string) {
		return roomName in this.rooms;
	}

	private createRoomUnsafe(owner: ServerUser, roomName: string) {
		const newRoom = ServerRoom.CreateRoom(owner, roomName);
		this.rooms[roomName] = newRoom;
	}

	private joinRoomUnsafe (user: ServerUser, roomName: string , callback:CallbackType) {
		const room = this.rooms[roomName];
		room.joinUser(user , (dto) => callback(ServerOperationResult.Successed(dto)));
	}

	
}
class ErrorReturn { 
	static RoomNotExistError () : ServerOperationResult {
		return ServerOperationResult.Failed("Room not exist");
	}
	static RoomExistError () : ServerOperationResult {
		return ServerOperationResult.Failed("Room exist");
	}
	static UserAlreadyJoinedError () : ServerOperationResult {
		return ServerOperationResult.Failed("User already joined in another room");
	}
	static UserNotInRoom () : ServerOperationResult {
		return ServerOperationResult.Failed("User not in joined to any room");
	}
}