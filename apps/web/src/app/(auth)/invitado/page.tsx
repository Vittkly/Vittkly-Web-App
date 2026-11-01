import React, { Suspense } from "react";
import GuestAccessForm from "@/features/auth/components/GuestAccessForm";

export default function InvitadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="bg-line/60 border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      }
    >
      <GuestAccessForm />
    </Suspense>
  );
}
