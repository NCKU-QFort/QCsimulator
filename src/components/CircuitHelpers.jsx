import React from "react";
import { theme } from "../utils.js";

/**
 * Render gate label with proper dagger superscript formatting
 */
export function renderGateLabel(label) {
  if (typeof label === "string" && label.endsWith("†")) {
    const base = label.slice(0, -1);
    return (
      <>
        {base}
        <sup style={{ fontSize: "0.6em", lineHeight: 0, position: "relative", top: "-0.25em" }}>
          †
        </sup>
      </>
    );
  }
  return label;
}

/**
 * Renders a control dot for multi-qubit gates
 */
export function ControlDot({ size = 14, color, style = {} }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        ...style,
      }}
    />
  );
}

/**
 * Renders a plus circle (used for X gate and CNOT target)
 */
export function PlusCircle({ size, color, preview = false }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: preview ? `${color}88` : color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#FFFFFF",
        fontSize: size * 0.72,
        lineHeight: 1,
        fontWeight: 700,
        boxShadow: preview ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      +
    </div>
  );
}

/**
 * Get measurement box style
 */
export const getMeasurementBoxStyle = (sz) => ({
  width: sz,
  height: sz,
  borderRadius: 7,
  background: theme.surface,
  border: `2px solid ${theme.border}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
});

/**
 * Renders measurement icon (arc and M label)
 */
export function MeasurementIcon({ isMobile }) {
  return (
    <>
      <div
        style={{
          width: 16,
          height: 9,
          borderBottom: `2px solid ${theme.textMid}`,
          borderRadius: "0 0 50% 50%",
          marginTop: 2,
          transform: "rotate(180deg)",
        }}
      />
      <div style={{ fontSize: 8, color: theme.textMid, marginTop: 1, fontWeight: 600 }}>
        M
      </div>
    </>
  );
}

/**
 * Renders a measurement arrow (dashed line + arrowhead)
 */
export function MeasurementArrow({ centerX, top, bottom, color, measurementArrowHeight = 9 }) {
  return (
    <>
      {/* Dashed line */}
      <div
        style={{
          position: "absolute",
          left: centerX,
          top,
          width: 0,
          height: Math.max(0, bottom - top - measurementArrowHeight),
          background: "transparent",
          borderLeft: `2.5px dashed ${color}`,
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      {/* Arrowhead pointing to classical wire */}
      <div
        style={{
          position: "absolute",
          left: centerX - 4.75,
          top: bottom - measurementArrowHeight,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `9px solid ${color}`,
          zIndex: 3,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/**
 * Get operation colors based on gate type
 */
export function getOperationColors(isOtherOperation, gate, OTHER_OPERATION_COLOR, OTHER_OPERATION_BG, OTHER_OPERATION_BORDER) {
  return {
    color: isOtherOperation ? OTHER_OPERATION_COLOR : gate.color,
    bg: isOtherOperation ? OTHER_OPERATION_BG : gate.bg,
    border: isOtherOperation ? OTHER_OPERATION_BORDER : gate.color,
  };
}

/**
 * Collect data from circuit for a given step using a matcher function
 */
export function collectStepData(circ, nq, step, matcher) {
  const results = [];
  for (let q = 0; q < nq; q++) {
    const g = circ[`${q}-${step}`];
    const result = matcher(g, q);
    if (result) results.push(result);
  }
  return results;
}
