import React, { Suspense } from "react";
import RegisterForm from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="bg-line/60 border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
