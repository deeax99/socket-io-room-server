import SocketIOServer from '../../../src/socket-io-room-server/server/socket-io-server';
import { container } from 'tsyringe';
import { instantiateServices } from '../../../src/app';
import { SocketTestUtility } from './util/socket-test-utility';
import { KeyValueDataChange } from '../../../src/socket-io-room-server/dto/data-key-value-change';

describe('Room User Data', () => {
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

  it('set user data', async () => {
    const data = new Map<string, any>([
      ['nickname', 'cooluser'],
      ['userID', '12345678']]);

    const client = await testUtility.createClient();
    await client.setData(data);

    expect(testUtility.checker.checkUserServerData(client['clientUserConnectionSocket'].socket.id, data)).toBeTruthy();
  });

  it('set user data checker', async () => {
    const setData: KeyValueDataChange = {
      'nickname': 'cooluser',
      'userID': '12345678',
    };
    const test1: KeyValueDataChange = {
      'nickname': 'notcooluser',
      'userID': '12345678',
    };
    const test2: KeyValueDataChange = {
      'nicknamex': 'notcooluser',
      'userID': '0000',
    };
    const test3: KeyValueDataChange = {
      'nicknamex': 'notcooluser',
    };

    const client = await testUtility.createClient();
    await client.setData(setData);

    const clientId = client['clientUserConnectionSocket'].socket.id;

    expect(testUtility.getUserData(clientId)).not.toEqual(test1);
    expect(testUtility.getUserData(clientId)).not.toEqual(test2);
    expect(testUtility.getUserData(clientId)).not.toEqual(test3);
  });

  it('mulitple set data', async () => {
    const data = {
      'nickname': 'cooluser',
      'userID': '12345678',
    };
    const data2 = { 'nickname': 'supercooluser' };
    const dataChecker = {
      'nickname': 'supercooluser',
      'userID': '12345678',
    };
    const client = await testUtility.createClient();
    await client.setData(data);
    await client.setData(data2);

    const clientId = client['clientUserConnectionSocket'].socket.id;

    expect(testUtility.getUserData(clientId)).toEqual(dataChecker);
  });

  it('remove user data', async () => {
    const data = {
      'nickname': 'cooluser',
      'userID': '12345678',
    };

    const dataChecker = {
      'nickname': 'cooluser',
    };

    const removeKeys = ['userID'];
    const client = await testUtility.createClient();
    await client.setData(data);
    await client.removeData(removeKeys);

    const clientId = client['clientUserConnectionSocket'].socket.id;

    expect(testUtility.getUserData(clientId)).toEqual(dataChecker);
  });
});

