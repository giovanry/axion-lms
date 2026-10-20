import { Suspense } from "react";
import { NotebookWorkspaceWrapper } from "./NotebookWorkspaceWrapper";

interface PageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  return [
    { id: "new" },
  ];
}

export default function NotebookDetailPage({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-slate-950 flex items-center justify-center text-slate-400">
          Memuat Workspace...
        </div>
      }
    >
      <NotebookWorkspaceWrapper id={params.id} />
    </Suspense>
  );
}
