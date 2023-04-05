import ServerUser from '../../user/server-user';
import { GenericObservableStaging } from '../../../util/observable';

export default class ServerRoomEvent {
  onUserJoin: GenericObservableStaging<ServerUser> = new GenericObservableStaging();
  onUserLeave: GenericObservableStaging<ServerUser> = new GenericObservableStaging();
  onUserDisconnect: GenericObservableStaging<ServerUser> = new GenericObservableStaging();
}
