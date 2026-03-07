// =============================================================================
// THEME
// =============================================================================

export const theme = {
  bg: "#F4F6FB",
  surface: "#FFFFFF",
  sidebar: "#EEF1F8",
  border: "#D8DEE9",
  borderLight: "#E8ECF4",
  text: "#1E293B",
  textMid: "#475569",
  textLight: "#94A3B8",
  wire: "#B0BEC5",
  accent: "#3B82F6",
  accentBg: "#EFF6FF",
  run: "#0EA5E9",
  hover: "#F1F5F9",
};

// =============================================================================
// COMMON STYLES
// =============================================================================

export const btnC = {
  width: 20,
  height: 20,
  borderRadius: 4,
  border: "1px solid #D8DEE9",
  background: "#FFF",
  color: "#475569",
  cursor: "pointer",
  fontSize: 13,
  fontFamily: "inherit",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  lineHeight: 1,
  fontWeight: 500,
};

export const secLbl = {
  fontSize: 10,
  fontWeight: 600,
  color: "#94A3B8",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 6,
};

// =============================================================================
// COMPLEX MATH
// =============================================================================

/**
 * Complex number multiplication: (a + bi) * (c + di)
 * @param {[number, number]} a - First complex number [real, imaginary]
 * @param {[number, number]} b - Second complex number [real, imaginary]
 * @returns {[number, number]} Result complex number
 */
export const cMul = (a, b) => [
  a[0] * b[0] - a[1] * b[1],
  a[0] * b[1] + a[1] * b[0],
];

/**
 * Complex number addition: (a + bi) + (c + di)
 * @param {[number, number]} a - First complex number [real, imaginary]
 * @param {[number, number]} b - Second complex number [real, imaginary]
 * @returns {[number, number]} Result complex number
 */
export const cAdd = (a, b) => [a[0] + b[0], a[1] + b[1]];

/**
 * Get the squared absolute value (magnitude squared) of a complex number
 * @param {[number, number]} a - Complex number [real, imaginary]
 * @returns {number} |a|^2
 */
export const cAbs2 = (a) => a[0] * a[0] + a[1] * a[1];

// =============================================================================
// FORMATTING
// =============================================================================

/**
 * Format a basis state index as a binary string
 * @param {number} i - State index
 * @param {number} n - Number of qubits
 * @returns {string} Formatted basis state label (e.g., "00")
 */
export function basisLabel(i, n) {
  return i.toString(2).padStart(n, "0").split("").reverse().join("");
}

/**
 * Format a basis state index as a ket notation string
 * @param {number} i - State index
 * @param {number} n - Number of qubits
 * @returns {string} Formatted ket notation (e.g., "|00⟩")
 */
export function basisLabelKet(i, n) {
  const binary = i.toString(2).padStart(n, "0").split("").reverse().join("");
  return `|${binary}⟩`;
}
