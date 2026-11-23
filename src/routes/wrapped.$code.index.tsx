import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/wrapped/$code/")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/wrapped/$code/$stage", params: { code: params.code, stage: "0" } });
  },
});
