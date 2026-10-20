"use client";

import { useSearchParams } from "next/navigation";
import { KaggleNotebookWorkspace } from "@/components/notebook/KaggleNotebookWorkspace";

export function NotebookWorkspaceWrapper({ id }: { id: string }) {
  const searchParams = useSearchParams();
  const dataset = searchParams ? searchParams.get("dataset") : null;

  return (
    <KaggleNotebookWorkspace
      notebookId={id}
      datasetRef={dataset}
    />
  );
}
