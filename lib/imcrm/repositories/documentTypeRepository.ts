// imcrm: ported from blanka's DocumentTypeRepository.
// TODO(blanka): pull the exact mapping used by DocumentTypeRepository::businessInsurerName()
// and confirm how byBusinessTypeOfCustomer() consumes it — this assumes a simple id->name
// lookup, which may not be accurate.
const BUSINESS_INSURER_NAMES: Record<number, string> = {};

export function businessInsurerName(businessTypeOfInsuranceId: number | null): string | null {
  if (businessTypeOfInsuranceId === null) return null;
  return BUSINESS_INSURER_NAMES[businessTypeOfInsuranceId] ?? null;
}
