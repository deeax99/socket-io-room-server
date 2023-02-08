import "reflect-metadata";
import { Server } from 'socket.io'
import { singleton } from 'tsyringe';

@singleton()
export default class SocketIOServer {
    private io: Server;

    constructor() {
        this.io = new Server({
            cors: {
                origin: "*"
            }
        });
    }

    public get server() {
        return this.io;
    }
    public listen(port: number): void {
        this.io.listen(port);
    }

    public close() {
        this.io.close();
    }
}