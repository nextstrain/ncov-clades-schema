export function findExactlyOne<T>(components: T[], predicate: (s: T) => boolean) {
  const candidates = components.filter(predicate)
  if (candidates.length > 1) {
    const c = candidates.map((s) => `"${JSON.stringify(s)}"`).join(',')
    throw new Error(`Expected to find exactly one element, but found: ${c}`)
  }
  return candidates[0]
}
