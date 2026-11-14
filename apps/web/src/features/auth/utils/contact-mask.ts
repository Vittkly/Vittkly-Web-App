export type OtpChannel = "correo" | "celular";

/**
 * Enmascara parcialmente un correo electrónico o número celular para mostrarlo
 * al usuario durante el flujo de verificación sin exponer el dato completo.
 */
export function maskContact(value: string, channel: OtpChannel): string {
  if (channel === "correo") {
    const [user, domain] = value.split("@");
    if (!user || !domain) return value;
    const visible = user.slice(0, 2);
    return `${visible}••••@${domain}`;
  }
  const clean = value.trim();
  if (clean.length < 6) return clean;
  return `${clean.slice(0, 3)} ••• ••${clean.slice(-2)}`;
}
