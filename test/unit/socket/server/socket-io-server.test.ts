import { SocketIOConnection } from '@server-room/server/socket-io-connection';
import SocketIOServer from '@server-room/server/socket-io-server';
import { Server, Socket } from 'socket.io';

jest.mock("socket.io");
jest.mock('@server-room/server/socket-io-connection')
jest.mock('@util/observable')

afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
})

describe('Socket IO Server', () => {

    let server: SocketIOServer;

    beforeEach(() => {
        jest.clearAllMocks();
        server = new SocketIOServer();
    });

    it('should constructor create instance of SocketIO.Server and assigned it to io variable', () => {
        const serverMock = Server as jest.MockedClass<typeof Server>;

        expect(serverMock).toBeCalledTimes(1);
        expect(serverMock).toHaveBeenCalledWith({ cors: { origin: '*', } });
        expect(serverMock).toReturnWith(server["io"]);
    });

    it("should constructor assign onConnectionEvent", () => {
        expect(server.onConnectionEvent).not.toBeNull();
    })

    it('should listen and close be called', () => {

        const ioServer = server["io"];
        const listenFn = ioServer.listen as jest.Mock;
        const closeFn = ioServer.close as jest.Mock;

        server.listen(8080);
        server.close();

        expect(listenFn).toHaveBeenNthCalledWith(1, 8080);
        expect(closeFn).toBeCalledTimes(1);
    });

    it("should listen call on with connection eventName", () => {
        const ioServer = server["io"];
        const onFn = ioServer.on as jest.Mock;

        server.listen(8080);

        expect(onFn).toBeCalledTimes(1);
        expect(onFn).toBeCalledWith("connection", expect.anything());
    })

    it("should send onConnectionEvent when connection event trigger", () => {
        const ioServer = server["io"];
        const newConnection = new Socket(undefined, undefined, undefined);
        const mockedIOConnection = SocketIOConnection as jest.MockedClass<typeof SocketIOConnection>;

        server.listen(8080);
        ioServer["receive"]("connection", newConnection);

        const socketIOConnectionInstance = mockedIOConnection.mock.instances[0];
        expect(mockedIOConnection).toHaveBeenNthCalledWith(1, newConnection);
        expect(server.onConnectionEvent["notify"]).toHaveBeenNthCalledWith(1, socketIOConnectionInstance);
    });
});