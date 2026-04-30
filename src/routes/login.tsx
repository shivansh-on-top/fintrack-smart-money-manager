// Convenience redirects so /login and /signup also work
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  beforeLoad: () => { throw redirect({ to: "/auth/login" }); },
});
