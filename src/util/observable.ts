export type Observer<T> = ((data: T) => void);

export type IObservableReader = IGenericObservableReader<void>; 
export type IObservable = IGenericObservable<void>; 

export interface IGenericObservableReader<T> {
  addListener(observer: Observer<T>);
  addListenerOnce(observer: Observer<T>);
}

export interface IGenericObservable<T> extends IGenericObservableReader<T> {
  notify(t: T);
  removeListener(observer: Observer<T>);
}

export class GenericObservable<T> implements IGenericObservable<T>{
  private observers: Observer<T>[] = [];
  private onceObservers: Observer<T>[] = [];

  addListener(observer: Observer<T>) {
    this.observers.push(observer);
  }
  addListenerOnce(observer: Observer<T>) {
    this.onceObservers.push(observer);
  }

  removeListener(handler: Observer<T>) {
    this.observers = this.observers.filter((filterHandler) => filterHandler != handler);
  }
  notify(t: T) {
    this.observers.forEach((observer) => {
      observer(t);
    });
    this.onceObservers.forEach((observer) => {
      observer(t);
    });
    this.onceObservers = [];
  }

  waitForNotify(action?: () => void): Promise<T> {
    return new Promise<T>((callback) => {
      if (action != undefined) {
        action();
      }
      this.addListenerOnce((data) => callback(data));
    });
  }
}

export class GenericObservableStaging<T> {
  pre: GenericObservable<T> = new GenericObservable<T>();
  post: GenericObservable<T> = new GenericObservable<T>();
  notify(arg: T, middleCall: () => void = undefined) {
    this.pre.notify(arg);
    if (middleCall != undefined) {
      middleCall();
    }
    this.post.notify(arg);
  }
}

export class Observable extends GenericObservable<void> {}