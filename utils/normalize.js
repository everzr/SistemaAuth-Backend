// backend/utils/normalize.js
export function normalize(s = "") {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/\s+/g, " ") // colapsa espacios
    .trim()
    .toLowerCase();
}
