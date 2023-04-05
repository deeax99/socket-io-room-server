import { UserDataValue } from "./data-key-value-change";

export default class ServerOperationResult {
  public success: boolean;
  public message?: string;
  public errorCode?: number;
  public data?: UserDataValue;

  static succeed(data: UserDataValue = undefined): ServerOperationResult {
    const instance = new ServerOperationResult();

    instance.data = data;
    instance.success = true;
    return instance;
  }

  static failed(message?: string, errorCode?: number): ServerOperationResult {
    const instance = new ServerOperationResult();

    instance.success = false;
    instance.message = message;
    instance.errorCode = errorCode;

    return instance;
  }
}