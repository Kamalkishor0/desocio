export function getParam(
    value: unknown
): string | undefined {
    if (typeof value === "string") {
        return value;
    }

    if (Array.isArray(value)) {
        return value[0];
    }

    return undefined;
}