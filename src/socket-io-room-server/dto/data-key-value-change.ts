export type UserDataValue = string | number | boolean | { [key: string]: UserDataValue } | UserDataValue[];
export type KeyValueDataChange = { [id: string]: UserDataValue };
export type KeyValueData = { [id: string]: UserDataValue };