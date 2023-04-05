import SocketIOServer from '../../../../src/socket-io-room-server/server/socket-io-server';
import {container} from 'tsyringe';
import {instantiateServices} from '../../../../src/app';
import {SocketTestUtility} from './socket-test-utility';

let testUtility: SocketTestUtility = null;
let server: SocketIOServer = null;

const roomName = 'testing_room_1';
const roomName2 = 'testing_room_2';

beforeAll(() => {
  server = new SocketIOServer();
  server.listen(SocketTestUtility.port);
  testUtility = new SocketTestUtility();
});
beforeEach(() => {
  const continerServer = container.resolve(SocketIOServer);
  continerServer['io'] = server['io'];
  instantiateServices();
  testUtility.listenToUser();
});
afterEach(() => {
  container.clearInstances();
  const serverIO = server['io'];
  serverIO.disconnectSockets();
  serverIO.removeAllListeners();
});
afterAll(() => {
  if (server != null) {
    server.close();
  }
});
