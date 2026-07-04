"use client";

import { useRouter } from "next/navigation";
import { AuthPanel } from "@/components/auth-panel";

export default function Page() {
	const router = useRouter();

	return (
		<main className="min-h-screen flex">
			<section className="hidden md:flex w-1/2 bg-slate-900 items-center">
				<div className="max-w-lg ml-24">
					<h1 className="text-6xl font-extrabold text-white">
						DeSocio
					</h1>
				</div>
			</section>

			<section className="flex-1 md:w-1/2 flex items-center justify-center bg-zinc-100 p-8">
				<AuthPanel onAuthed={() => router.push("/home")} />
			</section>
		</main>
	);
}