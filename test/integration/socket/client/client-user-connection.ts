import { Socket, io } from 'socket.io-client';
import ServerOperationResult from '../../../../src/socket-io-room-server/dto/server-operation-result';
import { Awaiter, GenericAwaiter } from '../../../../src/util/awaiter';
import { OldGenericObservable, OldObservable } from '../../../../src/util/observable';
import ClientRoom from './client-room';
import { ClientUser } from './client-user';
import { KeyValueDataChange } from '../../../../src/socket-io-room-server/dto/data-key-value-change';

abstract class AbstractClientHandler {
  constructor(
    protected clientConnectionEvents: ClientUserConnectionEvent,
    protected clientData: ClientUserConnectionData,
    protected connectionSocket: ClientUserConnectionSocket) {
    this.clientConnectionEvents.onConnect.addListener(() => this.onConnect());
    this.clientConnectionEvents.onJoinRoom.addListener(this.onJoinRoom);
    this.clientConnectionEvents.onDisconnect.addListener(this.onDisconnect);
  }

  onJoinRoom = () => { };
  onConnect = () => { };
  onDisconnect = () => { };
}

class ClientRoomEventHandler {

}

class ClientUserEventHandler extends AbstractClientHandler {
  override onConnect = () => {
    this.connectionSocket.socket.once('disconnect', () => {
      this.disconnectEvent();
    });
  };

  disconnectEvent = () => {
    if (this.clientData.state == ClientUserState.Disconnected) {
      return;
    }

    this.clientData.state = ClientUserState.Disconnected;
    this.clientConnectionEvents.onDisconnect.invoke();
  };
}

class ClientUserConnectionHandlers {
  private handlers = [
    ClientUserConnectionHandlers,
  ];

  constructor(clientConnectionEvents: ClientUserConnectionEvent,
    clientData: ClientUserConnectionData,
    connectionSocket: ClientUserConnectionSocket) {
    const clientUserEventHandler = new ClientUserEventHandler(clientConnectionEvents, clientData, connectionSocket);
  }
  private disconnectionHandler = () => {

  };
}

export class ClientUserConnectionData {
  public state: ClientUserState;
  constructor() {
    this.state = ClientUserState.Disconnected;
  }
  /*
    private clientRoom:ClientRoom;
    public clientUser:ClientUser;
    */
}


export class ClientUserConnectionEvent {
  onJoinRoom: OldObservable = new Observable();
  onLeaveRoom: OldObservable = new Observable();
  onConnect: OldObservable = new Observable();
  onDisconnect: OldObservable = new Observable();
}

class ClientUserConnectionSocket {
  public socket: Socket;
}

export enum ClientUserState {
  Connected, Disconnected, InRoom
}

export default class ClientUserConnection {
  private clientConnectionEvents: ClientUserConnectionEvent;
  private clientData: ClientUserConnectionData;
  private clientConnectionHandlers: ClientUserConnectionHandlers;
  private clientUserConnectionSocket: ClientUserConnectionSocket;

  constructor() {
    this.clientData = new ClientUserConnectionData();
    this.clientConnectionEvents = new ClientUserConnectionEvent();
    this.clientUserConnectionSocket = new ClientUserConnectionSocket();
    this.clientConnectionHandlers = new ClientUserConnectionHandlers(this.clientConnectionEvents, this.clientData, this.clientUserConnectionSocket);
  }

  async joinRoom(roomName: string, msTimeout = 5000) {
    const result = await this.roomOperation('joinRoom', roomName, msTimeout);
    if (result.success) {
    }
    return result;
  }

  async createRoom(roomName: string, msTimeout = 5000) {
    const result = await this.roomOperation('createRoom', roomName, msTimeout);

    return result;
  }

  async leaveRoom(msTimeout = 5000) {
    const result = await this.roomOperation('leaveRoom', undefined, msTimeout);

    return result;
  }

  async disconnect() {
    if (this.clientData.state == ClientUserState.Disconnected) return;

    this.clientUserConnectionSocket.socket.emit('server-disconnection')
    const waitDisconnectionPromise = this.clientConnectionEvents.onDisconnect.actionAndWaitInvoke(); 
    await waitDisconnectionPromise;
  }

  async setData(data: KeyValueDataChange, msTimeout = 5000) {
    const awaiter = new Awaiter();
    this.clientUserConnectionSocket.socket.emit('setData', data, () => {
      awaiter.complete();
    });

    await awaiter.getPromise(msTimeout);
  }

  async removeData(keys: string[], msTimeout = 5000) {
    const awaiter = new Awaiter();
    this.clientUserConnectionSocket.socket.emit('removeData', keys, () => {
      awaiter.complete();
    });

    await awaiter.getPromise(msTimeout);
  }


  private roomOperation(opName: string, roomName: string | undefined, msTimeout: number): Promise<ServerOperationResult> {
    if (this.clientData.state != ClientUserState.Connected) {
      throw new Error('Client isn\'t connected');
    }
    const joinAwaiter = new GenericAwaiter<ServerOperationResult>();
    if (roomName != undefined) {
      this.clientUserConnectionSocket.socket.emit(opName, roomName, (response: ServerOperationResult) => {
        joinAwaiter.complete(response);
      });
    } else {
      this.clientUserConnectionSocket.socket.emit(opName, (response: ServerOperationResult) => {
        joinAwaiter.complete(response);
      });
    }
    return joinAwaiter.getPromise(msTimeout);
  }

  async connect(url: string, msTimeout = 5000) {
    if (this.clientData.state != ClientUserState.Disconnected) return;

    const connectionAwaiter = new Awaiter();
    const socket = io(url);
    this.clientUserConnectionSocket.socket = socket;

    socket.on('connect', () => {
      connectionAwaiter.complete();
    });

    await connectionAwaiter.getPromise(msTimeout);

    this.clientData.state = ClientUserState.Connected;

    this.clientConnectionEvents.onConnect.invoke();
  }
}
