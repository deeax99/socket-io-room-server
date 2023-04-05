import { IGenericObservable} from '@util/observable';

const originalModule = jest.requireActual<typeof import("@util/observable")>("@util/observable");

export class GenericObservable<T> implements IGenericObservable<T>{

    constructor() {
        this["actualObservable"] = new originalModule.GenericObservable<T>();
    }

    addListener = jest.fn(observer => {
        this["actualObservable"].addListener(observer)
    });

    addListenerOnce = jest.fn(observer => {
        this["actualObservable"].addListenerOnce(observer)
    });

    removeListener = jest.fn(handler => {
        this["actualObservable"].removeListener(handler)
    });

    notify = jest.fn(t => {
        this["actualObservable"].notify(t)
    });
}

export class GenericObservableStaging<T> {
    constructor() {
        const originalModule = jest.requireActual<typeof import("@util/observable")>("@util/observable");
        this["actualObservableStaging"] = new originalModule.GenericObservableStaging<T>();
    }
    notify = jest.fn((arg, middleCall) => {
        this["actualObservableStaging"].notify(arg, middleCall);
    });
}

export class Observable extends GenericObservable<void> {}