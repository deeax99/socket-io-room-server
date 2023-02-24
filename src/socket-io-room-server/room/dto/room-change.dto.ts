
export interface ClientUserDto {
    data: any;
    state: any;
    id: string;
}

export interface ClientRoomDto {
    users: ClientUserDto[];
    ownerId: number;
    localUserId: number;
    state: any;
}

export interface StateChange {
    changes: { [key: string]: any };
}

export interface RoomChangeDto {
    joinedUser?: ClientUserDto[];
    leftUsers?: ClientUserDto[];
    roomStateChanges?: StateChange;
    userStateChange?: { [userID: string]: StateChange };
    userDataChange?: { [userID: string]: StateChange };
    newOwnerId?: string;
}
