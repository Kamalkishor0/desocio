export interface FeedCursor {
    createdAt: Date;
    id: string;
}

export function getSingleString(value: unknown): string | undefined {
    return typeof value === "string"
        ? value
        : undefined;
}

export function parseFeedCursor(
    value: string | undefined
): FeedCursor | undefined {
    if (!value) {
        return undefined;
    }

    const [createdAtRaw, id] = value.split("|");

    if (!createdAtRaw || !id) {
        return undefined;
    }

    const createdAt = new Date(createdAtRaw);

    if (Number.isNaN(createdAt.getTime())) {
        return undefined;
    }

    return {
        createdAt,
        id,
    };
}

export function createFeedCursor(
    createdAt: Date,
    id: string
): string {
    return `${createdAt.toISOString()}|${id}`;
}