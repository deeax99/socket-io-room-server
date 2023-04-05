/*
import "reflect-metadata";
import { App, instantiateServices } from "./app";
import { container } from "tsyringe";

function entryPoint () {
    instantiateServices();
    const main = container.resolve(App);
    main.run();
}

entryPoint();
*/

import { Container } from 'inversify';
import { IServer, SERVER_SYMBOL } from './socket-io-room-server/server/types/server';
import SocketIOServer from './socket-io-room-server/server/socket-io-server';

const main = new Container();
main.bind<IServer>(SERVER_SYMBOL).to(SocketIOServer).inSingletonScope();

/*
const x = main.get<Server>(ServerSymbol);
const y = main.get<Server>(ServerSymbol);
const z = main.get<Server>(ServerSymbol);
*/
