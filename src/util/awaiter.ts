type resolverType<T> = (args:T) => void;
type resolverErrorType = (reason?: string) => void;

abstract class BaseGenericAwaiter<T> { 
    protected promise: Promise<T> = null;


    protected promiseResolver: resolverType<T>;
    protected promiseError: resolverErrorType;

    protected finished:boolean = false;

    constructor() {
        const promiseFunc = (resolve: resolverType<T>, error: resolverErrorType) => {
            this.promiseError = error;
            this.promiseResolver = resolve;
        };

        this.promise = new Promise((resolve, error) => {
            promiseFunc(resolve, error);
        });

        this.promise.then().catch();
    }

    
    public error(reason?: string) {
        this.promiseError(reason);
    }

    protected timeoutPromise(ms: number) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!this.finished)
                    reject(`Timeout after ${ms}ms`);
            }, ms);
        });
    }
    protected baseComplete () {
        this.finished = true;
    }
    
}

export class GenericAwaiter<T> extends BaseGenericAwaiter<T> { 
    public complete(args:T) {
        this.baseComplete();
        this.promiseResolver(args);
    }
    public async getPromise(msTimeout?: number): Promise<T> {
        if (msTimeout != undefined) {
            const raceResult = await Promise.race([this.timeoutPromise(msTimeout), this.promise]);
        }
        return await this.promise;
    }
}

export class Awaiter extends BaseGenericAwaiter<void>{
    public complete() {
        this.baseComplete();
        this.promiseResolver();
    }
    public async getPromise(msTimeout?: number): Promise<void> {

        if (msTimeout == undefined)
            await this.promise;
        else {
            const raceResult = await Promise.race([this.timeoutPromise(msTimeout), this.promise]);
        }
    }
}