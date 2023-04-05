import { UserDataValue } from "./data-key-value-change";

export interface ClientUserDto {
    data: UserDataValue;
    state: UserDataValue;
    id: string;
}

export interface ClientRoomDto {
    users: ClientUserDto[];
    ownerId: number;
    localUserId: number;
    state: UserDataValue;
}

export interface StateChange {
    changes: { [key: string]: UserDataValue };
}

export interface RoomChangeDto {
    joinedUser?: ClientUserDto[];
    leftUsers?: ClientUserDto[];
    roomStateChanges?: StateChange;
    userStateChange?: { [userID: string]: StateChange };
    userDataChange?: { [userID: string]: StateChange };
    newOwnerId?: string;
}