import {ClientUser} from './client-user';

export default class ClientRoom {
  users:ClientUser[] = [];
  usersState:any;
  roomState:any;
  ownerID:string;
  roomName:string;

  async setState() {

  }
}
