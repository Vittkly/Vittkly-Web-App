import React from "react";
import type { Metadata } from "next";
import { getInvitationByToken } from "@/features/auth/services/invitacion-activation.service";
import { ActivarInvitacionView } from "@/features/auth/components/ActivarInvitacionView";

export const metadata: Metadata = {
  title: "Activar Invitación | Vittkly",
  description: "Activa tu cuenta de acceso a la empresa en Vittkly SaaS",
};

interface ActivarInvitacionPageProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function ActivarInvitacionPage({
  searchParams,
}: ActivarInvitacionPageProps) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token ?? "";

  const initialStatus = await getInvitationByToken(token);

  return <ActivarInvitacionView initialStatus={initialStatus} token={token} />;
}
