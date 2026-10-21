import React from 'react';

import { AuthScreenLayout } from '../components/AuthScreenLayout';
import { ForgotRequestStep } from '../components/ForgotRequestStep';
import { ForgotVerifyStep } from '../components/ForgotVerifyStep';
import { useForgotPassword } from '../hooks/useForgotPassword';

export function ForgotPasswordScreen() {
  const {
    method,
    setMethod,
    step,
    email,
    setEmail,
    phone,
    setPhone,
    otpCode,
    setOtpCode,
    error,
    setError,
    isSubmitting,
    subtitleByMethod,
    handleBackPress,
    handleSendCode,
    handleVerifyCode,
  } = useForgotPassword();

  return (
    <AuthScreenLayout
      testID="forgot-password-screen"
      backButtonTestID="forgot-back-btn"
      onBackPress={handleBackPress}
    >
      {step === 'request' ? (
        <ForgotRequestStep
          method={method}
          onSelectMethod={m => {
            setMethod(m);
            setError(null);
          }}
          subtitle={subtitleByMethod[method]}
          email={email}
          onChangeEmail={setEmail}
          phone={phone}
          onChangePhone={setPhone}
          error={error}
          isSubmitting={isSubmitting}
          onSubmit={() => void handleSendCode()}
        />
      ) : (
        <ForgotVerifyStep
          email={email}
          otpCode={otpCode}
          onChangeOtpCode={setOtpCode}
          error={error}
          isSubmitting={isSubmitting}
          onVerify={code => void handleVerifyCode(code)}
          onResend={() => void handleSendCode()}
        />
      )}
    </AuthScreenLayout>
  );
}
