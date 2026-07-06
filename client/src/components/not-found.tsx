import { SearchX } from "lucide-react";

type NotFoundProps = {
  title?: string;
  description?: string;
};

export function NotFound({
  title = "Not Found",
  description = "The resource you're looking for doesn't exist.",
}: NotFoundProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center px-6">
      <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/60 p-10 text-center shadow-2xl shadow-slate-950/40">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
          <SearchX className="h-10 w-10 text-slate-400" />
        </div>

        <h1 className="mt-6 text-2xl font-semibold text-white">
          {title}
        </h1>

        <p className="mt-3 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}