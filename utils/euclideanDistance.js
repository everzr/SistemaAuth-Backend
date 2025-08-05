export function euclideanDistance(vec1, vec2) {
  if (vec1.length !== vec2.length) return Infinity;

  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    const diff = vec1[i] - vec2[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}
