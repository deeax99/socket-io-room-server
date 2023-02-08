export type GenericHandler<T> = ((data: T) => void);
export type Handler = (() => void);

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