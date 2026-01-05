/**
 * Normalize entity name for duplicate detection
 * - Trim whitespace
 * - Collapse multiple spaces to single space
 * - Convert to lowercase
 */
export function normalizeEntityName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Find duplicate entities by normalized name
 * Returns a Map where key is normalized name and value is array of entities with that name
 * Only returns groups with more than 1 entity (actual duplicates)
 */
export function findDuplicates<T extends { id: string; name: string }>(
  items: T[]
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  
  items.forEach(item => {
    const normalized = normalizeEntityName(item.name);
    const existing = groups.get(normalized) || [];
    groups.set(normalized, [...existing, item]);
  });
  
  // Filter only groups with more than 1 member (actual duplicates)
  const duplicates = new Map<string, T[]>();
  groups.forEach((group, key) => {
    if (group.length > 1) {
      duplicates.set(key, group);
    }
  });
  
  return duplicates;
}

/**
 * Get total count of duplicate items
 */
export function getDuplicateCount<T extends { id: string; name: string }>(
  items: T[]
): { groupCount: number; totalDuplicates: number } {
  const duplicates = findDuplicates(items);
  let totalDuplicates = 0;
  
  duplicates.forEach(group => {
    // Count all but one as "duplicates" (extras beyond the original)
    totalDuplicates += group.length - 1;
  });
  
  return {
    groupCount: duplicates.size,
    totalDuplicates,
  };
}
