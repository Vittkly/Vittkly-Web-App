import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { verifyStaffAccess } from "@/features/auth/services/auth.service";
import { StaffLoginForm } from "@/features/auth/components/StaffLoginForm";

async function StaffLoginGate() {
  const staffStatus = await verifyStaffAccess();

  if (staffStatus.isAuthenticated && staffStatus.isStaff) {
    redirect("/internal/dashboard");
  }

  return <StaffLoginForm />;
}

export default function InternalLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="bg-line/60 border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      }
    >
      <StaffLoginGate />
    </Suspense>
  );
}
