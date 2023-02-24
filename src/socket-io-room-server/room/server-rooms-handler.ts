import ServerRoom from "./server-room";
import ServerUser from "../user/server-user";
import { injectable, singleton } from "tsyringe";
import ServerOperationResult from "../operation/server-operation-result";
import { ServerUserConnectionState } from "../user/server-user-connection-state-handler";
import { RoomChangeDto } from "./dto/room-change.dto";

type Rooms =  { [id: string]: ServerRoom };

@singleton()
export default class ServerRoomsHandler {
	private rooms:Rooms = {};

	constructor(){}

	joinRoom(user: ServerUser, roomName: string) : ServerOperationResult { 
		if (!this.isRoomExist(roomName)) {
			return ErrorReturn.RoomNotExistError();
		}
		else if (user.connectionState.state != ServerUserConnectionState.Connected) {
			return ErrorReturn.UserAlreadyJoinedError();
		}
		//check if room full
		else {
			const result = this.joinRoomUnsafe(user, roomName);
			return ServerOperationResult.Successed(result);
		}
	}

	createRoom(owner: ServerUser, roomName: string) : ServerOperationResult {
		if (this.isRoomExist(roomName)) {
			return ErrorReturn.RoomExistError();
		}
		else if (owner.connectionState.state != ServerUserConnectionState.Connected) {
			return ErrorReturn.UserAlreadyJoinedError();
		}
		else {
			const result = this.createRoomUnsafe(owner , roomName);
			return ServerOperationResult.Successed(result);
		}
	}

	leaveRoom(user: ServerUser) : ServerOperationResult {
		
		const roomName = user.connectionState.roomName;
		const room = this.rooms[roomName];
		if (user.connectionState.state != ServerUserConnectionState.InRoom) {
			return ErrorReturn.UserNotInRoom();
		}
		else {
			room.leaveUser(user);
			return ServerOperationResult.Successed();
		}
	}

	removeRoom(roomName: string) {
		delete this.rooms[roomName];
	}

	private isRoomExist(roomName: string) {
		return roomName in this.rooms;
	}

	private createRoomUnsafe(owner: ServerUser, roomName: string) {
		const newRoom = new ServerRoom(owner, roomName, this);
		this.rooms[roomName] = newRoom;
	}

	private joinRoomUnsafe (user: ServerUser, roomName: string) : RoomChangeDto {
		const room = this.rooms[roomName];
		return room.joinUser(user);
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