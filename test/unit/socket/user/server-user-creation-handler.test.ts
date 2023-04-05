import { ServerFake } from '../util/server-fake';
import ServerUser from '@server-room/user/server-user';
import { IServer } from '@server-room/server/types/server';
import ServerUserCreationHandler from '@server-room/user/server-user-creation-handler';
import { ServerConnectionFake } from '../util/server-connection-fake';

jest.mock('@util/observable');

afterEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
})

describe('ServerUserCreationHandler', () => {

  let server: IServer;
  let userCreationHandler: ServerUserCreationHandler;

  beforeAll(() => {
    server = new ServerFake();
    userCreationHandler = new ServerUserCreationHandler(server);
  })
  
  it("should constructor create onUserConnect and listen to onConnectionEvent", () => {
    expect(userCreationHandler.onUserConnect).not.toBeNull();
    expect(server.onConnectionEvent.addListener).toBeCalled();
  })

  it('should create serverUser and trigger onUserConnect event when new connection', () => {
    const onUserConnectListener = jest.fn();
    const connection = new ServerConnectionFake();
    const onUserConnection = userCreationHandler.onUserConnect;
    
    onUserConnection.addListener(onUserConnectListener);
    server.onConnectionEvent["notify"](connection);

    expect(onUserConnectListener).toBeCalledWith(expect.any(ServerUser) as ServerUser);
  });
});
