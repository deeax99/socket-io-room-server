import SocketIOServer from '../../../src/socket-io-room-server/server/socket-io-server';
import { container } from 'tsyringe';
import { instantiateServices } from '../../../src/app';
import { SocketTestUtility } from './util/socket-test-utility';
import { RoomChangeDto } from '../../../src/socket-io-room-server/dto/room-change.dto';

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

  it('Room Event Join Dto', async () => {
    const clientData = {
      'name': 'coolName',
    };

    const clientState = {
      'score': '-1/12',
    };

    const roomState = {

    };

    const client = await testUtility.createClient();
    const client2 = await testUtility.createClient();


    await client.setData(clientData);
    await client.createRoom(roomName);

    const clientId = client['clientUserConnectionSocket'].socket.id;

    const joinResult = await client2.joinRoom(roomName);
    const expectedChange: RoomChangeDto = {
      newOwnerId: clientId,
      joinedUser: [
        {
          data: clientData,
          id: clientId,
          state: {},
        },
      ],
    };

    expect(joinResult.data).toStrictEqual(expectedChange);
  });

  it('Room Test', async () => {
    throw Error('need implemenation');
  });
});

