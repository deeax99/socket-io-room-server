export type GenericHandler<T> = ((data: T) => void);
export type Handler = (() => void);

export class GenericObservableStagin<T> {
    pre: GenericObservable<T> = new GenericObservable<T>();
    post: GenericObservable<T> = new GenericObservable<T>();
    invoke(arg: T, middleCall: () => any = undefined) {
        this.pre.invoke(arg);
        if (middleCall != undefined) {
            middleCall();
        }
        this.post.invoke(arg);
    }
}

export class GenericObservable<T> {
    private handlers: GenericHandler<T>[] = [];
    addListener(handler: GenericHandler<T>) {
        this.handlers.push(handler);
    }
    removeListener(handler: GenericHandler<T>) {
        this.handlers = this.handlers.filter(filterHandler => filterHandler != handler);
    }
    invoke(data: T) {
        this.handlers.forEach(handler => {
            handler(data);
        })
    }
}

export class Observable {
    private handlers: Handler[] = [];
    addListener(handler: Handler) {
        this.handlers.push(handler);
    }
    removeListener(handler: Handler) {
        this.handlers = this.handlers.filter(filterHandler => filterHandler != handler);
    }
    invoke() {
        this.handlers.forEach(handler => {
            handler();
        })
    }
}