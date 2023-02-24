import ServerUser from "../../user/server-user";
import { RoomChangeDto, ClientUserDto } from "./room-change.dto";

export default class RoomChangeBuilder {
    private constructor() { };
    private roomChange: RoomChangeDto = {};

    static Builder() {
        return new RoomChangeBuilder();
    }

    addUsers(users: ServerUser[]) {
        this.roomChange.joinedUser = [];
        users.forEach(user => {
            const clientDto: ClientUserDto = {
                id: user.id,
                data: user.dataHandler.getData(),
                state: {}
            };

            this.roomChange.joinedUser.push(clientDto);
        });
        return this;
    }

    setOwner(owner:ServerUser) {
        this.roomChange.newOwnerId = owner.id;
        return this;
    }

    build () {
        return this.roomChange;
    }
}
