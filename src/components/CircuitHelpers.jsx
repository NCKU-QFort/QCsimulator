import React from "react";

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
 * Renders a measurement arrow (dashed line + arrowhead)
 */
export function MeasurementArrow({ centerX, top, bottom, color, measurementArrowHeight = 9 }) {
  const lineHeight = Math.max(0, bottom - top - measurementArrowHeight);
  
  return (
    <>
      {/* Dashed line using SVG for consistent rendering across devices */}
      <svg
        style={{
          position: "absolute",
          left: centerX - 1.25,
          top,
          width: 2.5,
          height: lineHeight,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "visible",
        }}
      >
        <line
          x1="1.25"
          y1="0"
          x2="1.25"
          y2={lineHeight}
          stroke={color}
          strokeWidth="2"
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
      </svg>
      {/* Arrowhead pointing to classical wire */}
      <div
        style={{
          position: "absolute",
          left: centerX - 5.8,
          top: bottom - measurementArrowHeight,
          width: 0,
          height: 0,
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: `9px solid ${color}`,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/**
 * Get operation colors based on gate type
 */
export function getOperationColors(isOtherOperation, gate, theme) {
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
