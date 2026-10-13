/** Derive archives from the locked saved snapshot, never trust client archive values. */
export function removedEntries(
  before: any,
  after: any,
  path: string[] = [],
): { path: string[]; position: number; value: any }[] {
  if (Array.isArray(before)) {
    const result: { path: string[]; position: number; value: any }[] = [];
    before.forEach((value, position) => {
      if (!value || typeof value !== "object" || !(value.id || value.slug))
        return;
      const identity = value.id || value.slug;
      const found = Array.isArray(after)
        ? after.find((v) => (v?.id || v?.slug) === identity)
        : undefined;
      if (found)
        result.push(...removedEntries(value, found, [...path, "@" + identity]));
      else if (
        !["navigation", "pages"].includes(path[0]) &&
        value.layout !== "opener"
      )
        result.push({ path, position, value });
    });
    return result;
  }
  if (before && typeof before === "object")
    return Object.entries(before).flatMap(([key, value]) =>
      removedEntries(value, after?.[key], [...path, key]),
    );
  return [];
}
