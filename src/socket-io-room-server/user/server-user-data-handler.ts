import { KeyValueData, KeyValueDataChange, UserDataValue } from '../dto/data-key-value-change';

export default class ServerUserDataHandler {
  private userData: Map<string, UserDataValue>;

  constructor() {
    this.userData = new Map<string, UserDataValue>();
  }

  setData(data: KeyValueDataChange): void {
    for (const [key, value] of Object.entries(data)) {
      this.userData.set(key, value);
    }
  }

  getData(): KeyValueData {
    const data: KeyValueData = {};
    for (const [key, value] of this.userData.entries()) {
      data[key] = value;
    }
    return data;
  }

  removeData(keys: string[]): void {
    for (const key of keys) {
      this.userData.delete(key);
    }
  }
}
