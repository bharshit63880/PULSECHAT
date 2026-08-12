/**
 * Normalizes a value copied from an environment-file line into a provider
 * dashboard's value field. Dashboards already have a separate key field, so
 * `CLOUDINARY_API_KEY=...` must be reduced to its value before use.
 */
export const normalizeEnvironmentString = (value: string, variableName?: string) => {
  let normalized = value.trim();

  if (variableName) {
    const escapedVariableName = variableName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const assignment = normalized.match(new RegExp(`^${escapedVariableName}\\s*=\\s*(.*)$`, 'i'));

    if (assignment) {
      normalized = assignment[1]?.trim() ?? '';
    }
  }

  if (
    normalized.length >= 2 &&
    ((normalized.startsWith('"') && normalized.endsWith('"')) ||
      (normalized.startsWith("'") && normalized.endsWith("'")))
  ) {
    normalized = normalized.slice(1, -1).trim();
  }

  return normalized;
};
