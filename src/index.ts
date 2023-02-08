import "reflect-metadata";
import { App, instantiateServices } from "./app";
import { container } from "tsyringe";

function entryPoint () {
    instantiateServices();
    const main = container.resolve(App);
    main.run();
}

entryPoint();