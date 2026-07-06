import { Profile } from "@/components/[username]/profile";


export default async function Page({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    return <Profile username={username} />;
}