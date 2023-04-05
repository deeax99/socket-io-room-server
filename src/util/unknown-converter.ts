export function unknownToString(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    } else if (value === null || value === undefined) {
        throw new Error('Value cannot be null or undefined');
    } else if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'symbol') {
        return value.toString();
    } else {
        throw new Error(`Cannot convert value of type ${typeof value} to string`);
    }
}

export function unknownToNumber(value: unknown): number {
    if (typeof value === 'number') {
        return value;
    } else if (typeof value === 'string' && !isNaN(Number(value))) {
        return Number(value);
    } else {
        throw new Error(`Cannot convert value of type ${typeof value} to number`);
    }
}

export function unknownToBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
        return value;
    } else if (typeof value === 'string') {
        const lowerCaseValue = value.toLowerCase();
        if (lowerCaseValue === 'true') {
            return true;
        } else if (lowerCaseValue === 'false') {
            return false;
        }
    }
    throw new Error(`Cannot convert value of type ${typeof value} to boolean`);
}

export function unknownToType<T>(value: unknown): T {
    if (typeof value === 'object' && value !== null) {
        return value as T;
    }
    throw new Error(`Cannot convert value of type ${typeof value} to T`);
}

export function unknownToCallback<T>(value: unknown): T {
    if (typeof value === 'function' && value !== null) {
        return value as T;
    }
    throw new Error(`Cannot convert value of type ${typeof value} to T`);
}

export function unknownToEmptyCallback(value: unknown) {
    return unknownToCallback<() => void>(value);
}