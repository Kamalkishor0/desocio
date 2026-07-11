export interface CursorPage<T> {
    data: T[];
    hasMore: boolean;
    nextCursor: string | null;
}

export function getPaginationLimit(
    value: unknown,
    defaultLimit = 20,
    maxLimit = 50
): number {
    if (typeof value !== "string") {
        return defaultLimit;
    }

    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
        return defaultLimit;
    }

    return Math.min(maxLimit, Math.max(1, parsed));
}

export function createCursorPage<
    T extends {
        id: string;
    }
>(
    items: T[],
    limit: number
): CursorPage<T> {
    const hasMore = items.length > limit;

    const data = hasMore
        ? items.slice(0, limit)
        : items;

    return {
        data,
        hasMore,
        nextCursor: hasMore
            ? data[data.length - 1].id
            : null,
    };
}