export function extractElements(compound) {
    // for now use the following logic:
    // split by Captial letters, ignore numbers
    const r = /([A-Z][a-z]?)/g;
    return compound.match(r);
}