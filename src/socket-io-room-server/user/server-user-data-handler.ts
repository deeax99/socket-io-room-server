import { KeyValueData, KeyValueDataChange } from "../room/dto/data-key-value-change";

export default class ServerUserDataHandle {

    private userData: Map<string, any> = new Map<string, any>();
    setData(data: KeyValueDataChange) {
        Object.keys(data).forEach(key => {
            this.userData.set(key, data[key]);
        });
    }

    getData(): KeyValueData {
        return Object.fromEntries(this.userData);
    }

    removeData(keys: string[]) {
        keys.forEach(key => {
            if (this.userData.has(key)) {
                this.userData.delete(key);
            }
        });
    }
}