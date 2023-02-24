export default class ServerUserDataHandle {

    private userData: Map<string, any> = new Map<string, any>();
    setData(data: Map<string, any>) {
        for (let key of data.keys()) {
            this.userData.set(key, data.get(key));
        }
    }

    getData(): Map<string, any> {
        return this.userData;
    }

    getDataObject(): any {
        return Object.fromEntries(this.getData());
    }

    removeData(keys: string[]) {
        keys.forEach(key => {
            if (this.userData.has(key)) {
                this.userData.delete(key);
            }
        });
    }
}