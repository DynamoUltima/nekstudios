/**
 * Where a collection's nav link goes. FABRIC has a page of its own that the
 * header has always pointed at; every other collection is a shop filter.
 */
export const collectionLink = (name: string) => ({
  label: name,
  href: name === "FABRIC" ? "/fabric" : `/shop?c=${encodeURIComponent(name.toLowerCase())}`,
});
