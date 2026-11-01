/** Monograma de hasta dos letras a partir del nombre de la empresa. */
export function getOrganizationInitials(name: string): string {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return letters || "EM";
}
