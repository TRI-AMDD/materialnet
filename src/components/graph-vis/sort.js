function sortStringsAlpha (a, b) {
  return a < b ? -1 : (a > b ? 1 : 0);
}

function sortStringsLength (a, b) {
  if (a.length < b.length) {
    return -1;
  } else if (a.length > b.length) {
    return 1;
  } else {
    return sortStringsAlpha(a, b);
  }
}

export { sortStringsAlpha, sortStringsLength };