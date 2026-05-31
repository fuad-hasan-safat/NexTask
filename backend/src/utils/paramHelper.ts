/**
 * Safely extract string from request params or query
 * Express can return string | string[] for params/query in some configurations
 */
export function getParamString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}
