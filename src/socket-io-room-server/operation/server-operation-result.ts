export default class ServerOperationResult {
    constructor(public success: boolean, public message?: string, public errorCode?: number) { }

    static Successed(): ServerOperationResult {
        return new ServerOperationResult(true);
    }
    static Failed(message?: string, errorCode?: number): ServerOperationResult {
        return new ServerOperationResult(false, message, errorCode);
    }
} 