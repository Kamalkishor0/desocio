export function generateConversationKey(
    userAId: string,
    userBId: string
) {
    return [userAId, userBId].sort().join(":");
}