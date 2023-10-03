export function quickDiff(arrA, arrB) {
  if (arrA.length !== arrB.length) {
    return true;
  }

  for (const [i, element] of arrA.entries()) {
    if (element !== arrB[i]) {
      return true;
    }
  }

  return false;
}
