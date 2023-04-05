import 'reflect-metadata';
import ServerUserCreationHandler, { SERVER_USER_CREATION_SYMBOL } from '../server-user-creation-handler';
import ServerUser from '../server-user';
import { inject, injectable } from 'inversify';
import { unknownToEmptyCallback, unknownToType } from '../../../util/unknown-converter';
import { KeyValueDataChange } from '../../dto/data-key-value-change';

export const USER_DATA_HANDLER_SYMBOL = Symbol('UserDataHandler');

@injectable()
export default class UserDataHandler {
  constructor(@inject(SERVER_USER_CREATION_SYMBOL) usersHandler: ServerUserCreationHandler) {
    usersHandler.onUserConnect.addListener(this.handleUser);
  }

  handleUser = (serverUser: ServerUser) => {
    const socket = serverUser.connection;

    socket.on('setData', (unknownObj, unknownCallback) => {

      const callback = unknownToEmptyCallback(unknownCallback);
      const dataChangeObject = unknownToType<KeyValueDataChange>(unknownObj);

      serverUser.dataHandler.setData(dataChangeObject);
      callback();
    });

    socket.on('removeData', (unknownKeys, unknownCallback) => {

      const callback = unknownToEmptyCallback(unknownCallback);
      const keys = unknownToType<string[]>(unknownKeys);

      serverUser.dataHandler.removeData(keys);
      callback();
    });
  };
}
