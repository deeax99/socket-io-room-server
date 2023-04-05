import { SocketIOConnection } from "@server-room/server/socket-io-connection";
import { Socket } from "socket.io";

jest.mock("socket.io");
jest.mock('@util/observable')

afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
})

describe("Socket IO Connection", () => {

    let socketConnection: SocketIOConnection;
    let socket: Socket;

    beforeEach(() => {
        socket = new Socket(undefined, undefined, undefined);
        socketConnection = new SocketIOConnection(socket);
    })
    
    it("should constructor initialize onDisconnectObservable and listen to disconnect event", () => {
        expect(socketConnection["onDisconnectObservable"]).not.toBeNull();
        expect(socket.on).toHaveBeenNthCalledWith(1, "disconnect", expect.anything());
    })

    it("should disconnect call socket disconnect", () => {
        socketConnection.disconnect();
        expect(socket.disconnect).toBeCalledTimes(1);
    })

    it("should emit call socket emit", () => {
        const args = ["arg1", "arg2"];
        socketConnection.emit("eventName", ...args);
        expect(socket.emit).toHaveBeenNthCalledWith(1, "eventName", args);
    })

    it("should on call socket on", () => {
        const onCallback = jest.fn();
        socketConnection.on("eventName", onCallback);
        expect(socket.on).toHaveBeenLastCalledWith("eventName", onCallback);
    })

    it("should addDisconnectionListener add listener", () => {
        const disconnectionListener = jest.fn();
        socketConnection.addDisconnectionListener(disconnectionListener);
        expect(socketConnection["onDisconnectObservable"].addListener).toHaveBeenNthCalledWith(1, disconnectionListener);
    })

    it("should addDisconnectionListener trigger when disconnect event trigger", () => {
        socket["receive"]("disconnect");
        expect(socketConnection["onDisconnectObservable"].notify).toBeCalledTimes(1);
    })

    it("should return id", () => {
        const mockedSocketID = "100";
        expect(socketConnection.id).toBe(mockedSocketID);
    })
})