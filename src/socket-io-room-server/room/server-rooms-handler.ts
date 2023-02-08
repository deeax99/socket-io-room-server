import ServerRoom from "./server-room";
import ServerUser from "../user/server-user";
import { injectable, singleton } from "tsyringe";
import ServerOperationResult from "../operation/server-operation-result";
import { ServerUserConnectionState } from "../user/server-user-state";

type Rooms =  { [id: string]: ServerRoom };

@singleton()
export default class ServerRoomsHandler {
	private rooms:Rooms = {};

	constructor(){}

	joinRoom(user: ServerUser, roomName: string) : ServerOperationResult { 
		if (!this.isRoomExist(roomName)) {
			return this.roomNotExistError();
		}
		else if (user.connectionState.state != ServerUserConnectionState.Connected) {
			return this.userAlreadyJoinedError();
		}
		//check if room full
		else {
			this.joinRoomUnsafe(user, roomName);
			return ServerOperationResult.Successed();
		}
	}

	createRoom(owner: ServerUser, roomName: string) : ServerOperationResult {
		if (this.isRoomExist(roomName)) {
			return this.roomExistError();
		}
		else if (owner.connectionState.state != ServerUserConnectionState.Connected) {
			return this.userAlreadyJoinedError();
		}
		else {
			this.createRoomUnsafe(owner , roomName);
			return ServerOperationResult.Successed();
		}
	}

	leaveRoom(user: ServerUser) : ServerOperationResult {
		
		const roomName = user.connectionState.roomName;
		const room = this.rooms[roomName];
		if (user.connectionState.state != ServerUserConnectionState.InRoom) {
			return this.userNotInRoom();
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

	private joinRoomUnsafe (user: ServerUser, roomName: string) {
		const room = this.rooms[roomName];
		room.joinUser(user);
	}

	private roomNotExistError () : ServerOperationResult {
		return ServerOperationResult.Failed("Room not exist");
	}
	private roomExistError () : ServerOperationResult {
		return ServerOperationResult.Failed("Room exist");
	}
	private userAlreadyJoinedError () : ServerOperationResult {
		return ServerOperationResult.Failed("User already joined in another room");
	}
	private userNotInRoom () : ServerOperationResult {
		return ServerOperationResult.Failed("User not in joined to any room");
	}
}
