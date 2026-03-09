import React from "react";
import { getCellCenterX, getCellCenterY, monospaceFontFamily, inputValidationStyles } from "../utils.js";
import {
  GATE_DEFS,
  OTHER_OPERATION_COLOR,
  OTHER_OPERATION_BG,
  OTHER_OPERATION_BORDER,
} from "../gateDefinitions.js";

import {
  ControlDot,
  PlusCircle,
  MeasurementArrow,
  collectStepData,
  renderGateLabel,
} from "./CircuitHelpers.jsx";

/**
 * Renders a quantum gate visual representation
 */
function GateRenderer({ gate, isMobile, theme }) {
  if (!gate) return null;

  const t = gate.type;
  const sz = isMobile ? 36 : 42;

  if (t === "CNOT_CTRL") {
    return <ControlDot color={GATE_DEFS.CNOT.color} />;
  }

  if (t === "CNOT_TGT") {
    return <PlusCircle size={sz} color={GATE_DEFS.CNOT.color} />;
  }

  if (t === "X") {
    return <PlusCircle size={sz} color={GATE_DEFS.X.color} />;
  }

  if (t === "CZ_CTRL" || t === "CZ_TGT") {
    return <ControlDot color={GATE_DEFS.CZ.color} />;
  }

  if (t === "SWAP_A" || t === "SWAP_B") {
    return (
      <div style={{ fontSize: 16, color: GATE_DEFS.SWAP.color, fontWeight: "bold" }}>
        {"✕"}
      </div>
    );
  }

  if (t === "M") {
    return (
      <div
        style={{
          width: sz,
          height: sz,
          borderRadius: 7,
          background: OTHER_OPERATION_BG,
          border: `2px solid ${OTHER_OPERATION_BORDER}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: OTHER_OPERATION_COLOR,
          fontWeight: 700,
          fontSize: isMobile ? 14 : 16,
          fontFamily: monospaceFontFamily,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        M
      </div>
    );
  }

  const def = GATE_DEFS[t];
  if (!def) return null;

  return (
    <div
      style={{
        width: sz,
        height: sz,
        borderRadius: 7,
        background: def.bg,
        border: `2px solid ${def.color}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: def.color,
        fontWeight: 700,
        fontSize: isMobile ? 14 : 16,
        fontFamily: monospaceFontFamily,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {renderGateLabel(def.label)}
    </div>
  );
}

/**
 * Individual gate cell in the circuit grid
 */
function GateCell({ q, s, circ, selGate, pending, hovered, handleClick, setHovered, isMobile, CH, CW, theme }) {
  const gate = circ[`${q}-${s}`];
  const isHovered = hovered && hovered.q === q && hovered.s === s;
  const hasGate = Boolean(gate);
  const hasIfCondition = gate && gate.if && Number.isInteger(gate.if.value);
  const isIfAnchor = hasIfCondition && gate.if.anchor === q;
  const isIfApplicableGate = hasGate && gate.type !== "M";
  const canAttachIf = selGate === "IF" && isIfApplicableGate;
  const isMeasurementStepOccupied =
    selGate === "M" &&
    Object.entries(circ).some(([key, value]) => {
      if (value.type !== "M") return false;
      const step = Number.parseInt(key.split("-")[1], 10);
      return step === s;
    });
  const canPlace = selGate && selGate !== "IF" && selGate !== "DEL" && !hasGate && !(selGate === "M" && isMeasurementStepOccupied);
  const canDelete = selGate === "DEL" && hasGate;
  const isPendingTarget =
    pending &&
    ["CNOT", "CZ", "SWAP"].includes(pending.gate) &&
    pending.step === s &&
    pending.qubit !== q &&
    !hasGate;
  const isPendingSource =
    pending &&
    ["CNOT", "CZ", "SWAP"].includes(pending.gate) &&
    pending.step === s &&
    pending.qubit === q &&
    !hasGate &&
    GATE_DEFS[pending.gate] &&
    GATE_DEFS[pending.gate].qubits === 2;
  const isPendingMeasurementSource =
    pending && pending.gate === "M" && pending.step === s && pending.qubit === q && !hasGate;
  const showPendingTargetPreview = isPendingTarget && (isHovered || isMobile);

  return (
    <div
      onClick={() => handleClick(q, s)}
      onMouseEnter={() => setHovered({ q, s })}
      onMouseLeave={() => setHovered(null)}
      style={{
        width: CW,
        height: CH,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1,
        cursor: canPlace || isPendingTarget || (!selGate && hasGate) || canAttachIf || canDelete ? "pointer" : "default",
        background:
          showPendingTargetPreview
            ? "#3B82F612"
            : isHovered && (canPlace || (!selGate && hasGate) || canAttachIf || canDelete)
              ? theme.hover
              : "transparent",
        borderRadius: 5,
        transition: "background 0.1s",
      }}
    >
      <GateRenderer gate={gate} isMobile={isMobile} theme={theme} />

      {isIfAnchor && (
        <div
          style={{
            position: "absolute",
            top: isMobile ? 6 : 7,
            right: isMobile ? 7 : 8,
            fontSize: isMobile ? 8 : 9,
            fontWeight: 700,
            color: OTHER_OPERATION_COLOR,
            background: OTHER_OPERATION_BG,
            border: `1px solid ${OTHER_OPERATION_BORDER}`,
            borderRadius: 4,
            padding: "0px 3px",
            lineHeight: 1.2,
          }}
        >
          if
        </div>
      )}

      {/* Preview for single-qubit gate */}
      {!hasGate &&
        isHovered &&
        selGate &&
        !pending &&
        GATE_DEFS[selGate] &&
        GATE_DEFS[selGate].qubits === 1 && (
          selGate === "X" ? (
            <PlusCircle size={isMobile ? 36 : 42} color={GATE_DEFS.X.color} preview />
          ) : (
            <div
              style={{
                width: isMobile ? 36 : 42,
                height: isMobile ? 36 : 42,
                borderRadius: 7,
                border: `2px dashed ${GATE_DEFS[selGate].color}50`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: `${GATE_DEFS[selGate].color}50`,
                fontWeight: 700,
                fontSize: isMobile ? 13 : 16,
                fontFamily: monospaceFontFamily,
              }}
            >
              {renderGateLabel(GATE_DEFS[selGate].label)}
            </div>
          )
        )}

      {/* Preview for multi-qubit gate control/first qubit */}
      {!hasGate &&
        isHovered &&
        selGate &&
        !pending &&
        GATE_DEFS[selGate] &&
        GATE_DEFS[selGate].qubits === 2 && (() => {
          const gateColor = GATE_DEFS[selGate].color;
          
          if (selGate === "CNOT" || selGate === "CZ") {
            return <ControlDot color={gateColor} style={{ border: `2px dashed ${gateColor}80`, background: `${gateColor}40` }} />;
          } else if (selGate === "SWAP") {
            return (
              <div style={{ fontSize: 16, color: `${gateColor}80`, fontWeight: "bold" }}>
                {"✕"}
              </div>
            );
          }
          return null;
        })()}

      {/* Persistent preview for selected first qubit of multi-qubit gate */}
      {!hasGate && isPendingSource && pending && GATE_DEFS[pending.gate] && (() => {
        const gateType = pending.gate;
        const gateColor = GATE_DEFS[gateType].color;

        if (gateType === "CNOT" || gateType === "CZ") {
          return (
            <ControlDot
              color={gateColor}
              style={{
                border: `2px solid ${gateColor}`,
                background: `${gateColor}80`,
                boxShadow: `0 0 0 3px ${gateColor}22`,
              }}
            />
          );
        }

        if (gateType === "SWAP") {
          return (
            <div
              style={{
                fontSize: 16,
                color: gateColor,
                fontWeight: "bold",
                textShadow: `0 0 0.5px ${gateColor}`,
              }}
            >
              {"✕"}
            </div>
          );
        }

        return null;
      })()}

      {/* Preview for measurement */}
      {!hasGate && isHovered && selGate === "M" && !pending && !isMeasurementStepOccupied && (
        <div
          style={{
            width: isMobile ? 36 : 42,
            height: isMobile ? 36 : 42,
            borderRadius: 7,
            border: `2px dashed ${OTHER_OPERATION_BORDER}`,
            background: `${OTHER_OPERATION_BG}40`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: OTHER_OPERATION_COLOR,
            fontWeight: 700,
            fontSize: isMobile ? 14 : 16,
            fontFamily: monospaceFontFamily,
          }}
        >
          M
        </div>
      )}

      {/* Persistent preview for selected measurement qubit */}
      {isPendingMeasurementSource && (
        <div
          style={{
            width: isMobile ? 36 : 42,
            height: isMobile ? 36 : 42,
            borderRadius: 7,
            background: OTHER_OPERATION_BG,
            border: `2px solid ${OTHER_OPERATION_BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: OTHER_OPERATION_COLOR,
            fontWeight: 700,
            fontSize: isMobile ? 14 : 16,
            fontFamily: monospaceFontFamily,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          M
        </div>
      )}

      {/* Preview for multi-qubit gate target */}
      {!hasGate && showPendingTargetPreview && pending && GATE_DEFS[pending.gate] && (() => {
        const gateType = pending.gate;
        const gateColor = GATE_DEFS[gateType].color;
        
        if (gateType === "CNOT") {
          return <PlusCircle size={isMobile ? 36 : 42} color={gateColor} preview />;
        } else if (gateType === "CZ") {
          return <ControlDot color={gateColor} style={{ border: `2px dashed ${gateColor}80` }} />;
        } else if (gateType === "SWAP") {
          return (
            <div style={{ fontSize: 16, color: `${gateColor}80`, fontWeight: "bold" }}>
              {"✕"}
            </div>
          );
        }
        return null;
      })()}
    </div>
  );
}

/**
 * A single qubit wire (row) in the circuit
 */
function QubitWire({ q, ns, circ, selGate, pending, hovered, handleClick, setHovered, isMobile, CH, CW, LBL_W, theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: CH }}>
      <div
        style={{
          width: LBL_W,
          textAlign: "right",
          paddingRight: 6,
          fontFamily: monospaceFontFamily,
          fontSize: isMobile ? 11 : 13,
          color: theme.textMid,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        q[{q}]
      </div>

      <div style={{ display: "flex", position: "relative", marginLeft: 5 }}>
        {/* Horizontal wire line */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 1.5,
            background: theme.wire,
            zIndex: 0,
            opacity: 0.5,
          }}
        />

        {/* Gate cells */}
        {Array.from({ length: ns }, (_, stepIndex) => {
          const step = stepIndex + 1;

          return (
          <GateCell
            key={step}
            q={q}
            s={step}
            circ={circ}
            selGate={selGate}
            pending={pending}
            hovered={hovered}
            handleClick={handleClick}
            setHovered={setHovered}
            isMobile={isMobile}
            CH={CH}
            CW={CW}
            theme={theme}
          />
          );
        })}
      </div>
    </div>
  );
}

/**
 * A single classical bit wire (row) in the circuit
 */
function ClassicalBitWire({ nc, nq, ns, circ, cbits, isMobile, CH, CW, LBL_W, theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: CH }}>
      <div
        style={{
          width: LBL_W,
          textAlign: "right",
          paddingRight: 6,
          fontFamily: monospaceFontFamily,
          fontSize: isMobile ? 11 : 13,
          color: theme.textMid,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        c<sub style={{ fontSize: isMobile ? 8 : 10 }}>{nc}</sub>
      </div>

      <div style={{ display: "flex", position: "relative", marginLeft: 5, width: ns * CW }}>
        {/* Double horizontal lines for classical bit */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 3,
            borderTop: `1.5px solid ${theme.wire}`,
            borderBottom: `1.5px solid ${theme.wire}`,
            zIndex: 0,
            opacity: 0.5,
          }}
        />

        {/* Show cbit assignments and measured values */}
        {Array.from({ length: ns }, (_, stepIndex) => {
          const step = stepIndex + 1;

          // Find if there's a measurement at this step
          let measurementCbit = null;
          for (let q = 0; q < nq; q++) {
            const g = circ[`${q}-${step}`];
            if (g && g.type === "M" && g.cbit !== undefined) {
              measurementCbit = g.cbit;
              break;
            }
          }

          return (
            <div
              key={step}
              style={{
                width: CW,
                height: CH,
                zIndex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Show cbit assignment and measured value */}
              {measurementCbit !== null && (
                <div
                  style={{
                    fontSize: isMobile ? 9 : 10,
                    fontFamily: "'Source Code Pro', monospace",
                    pointerEvents: "none",
                    position: "absolute",
                    left: "calc(50% + 10px)",
                    top: isMobile ? 4 : 5,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div style={{ color: theme.cvalue, fontWeight: 600 }}>
                    c<sub style={{ fontSize: isMobile ? 7 : 8 }}>{measurementCbit}</sub>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Selector for choosing which classical bit to store measurement result
 */
function CbitSelector({ nc, nq, pending, handleCbitClick, isMobile, CH, CW, LBL_W, theme }) {
  if (!pending || pending.gate !== "M") return null;

  const left = LBL_W + 5 + (pending.step - 1) * CW;
  const top = getCellCenterY(pending.qubit, CH) + CH + 10;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        background: theme.surface,
        border: `2px solid ${theme.border}`,
        borderRadius: 8,
        padding: isMobile ? "8px 10px" : "10px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 100,
        minWidth: isMobile ? 140 : 160,
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 10 : 11,
          fontWeight: 600,
          color: theme.text,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        Select Classical Bit
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          justifyContent: "center",
        }}
      >
        {Array.from({ length: nc }, (_, i) => (
          <button
            key={i}
            onClick={() => handleCbitClick(i)}
            style={{
              padding: isMobile ? "4px 10px" : "6px 12px",
              background: theme.bg,
              border: `1.5px solid ${theme.border}`,
              borderRadius: 5,
              color: theme.textMid,
              cursor: "pointer",
              fontSize: isMobile ? 11 : 12,
              fontWeight: 600,
              fontFamily: "'Source Code Pro', monospace",
              transition: "all 0.1s",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f0f0f0";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = theme.bg;
              e.target.style.transform = "scale(1)";
            }}
          >
            c<sub>{i}</sub>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Editor for classical-if condition value
 */
function IfConditionEditor({
  nc,
  nq,
  pending,
  handleIfInputChange,
  applyPendingIf,
  removePendingIf,
  isMobile,
  CH,
  CW,
  LBL_W,
  theme,
}) {
  if (!pending || pending.gate !== "IF") return null;

  const left = getCellCenterX(pending.step, CW, LBL_W);
  const top = nq * CH + (isMobile ? 12 : 16) + CH + 10;
  const maxIfValue = (1 << Math.max(1, nc)) - 1;
  const input = pending.inputValue ?? "";
  const parsed = Number.parseInt(input, 10);
  const isValid = /^\d+$/.test(input) && Number.isInteger(parsed) && parsed >= 0 && parsed <= maxIfValue;

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        transform: "translateX(-50%)",
        background: theme.surface,
        border: `2px solid ${isValid ? theme.border : inputValidationStyles.invalidBorder}`,
        borderRadius: 8,
        padding: isMobile ? "8px 10px" : "10px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 110,
        minWidth: isMobile ? 110 : 124,
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 10 : 11,
          fontWeight: 600,
          color: theme.text,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        if condition (decimal)
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 12,
            color: "#666",
            fontFamily: "'Source Code Pro', monospace",
            fontWeight: 700,
            minWidth: 16,
            textAlign: "center",
          }}
        >
          ==
        </span>
        <input
          value={input}
          onChange={(e) => handleIfInputChange(e.target.value)}
          style={{
            width: isMobile ? 56 : 64,
            padding: isMobile ? "5px 7px" : "6px 8px",
            borderRadius: 5,
            border: `1.5px solid ${isValid ? theme.border : inputValidationStyles.invalidBorder}`,
            outline: "none",
            fontFamily: "'Source Code Pro', monospace",
            fontSize: isMobile ? 11 : 12,
            color: isValid ? theme.text : inputValidationStyles.invalidText,
            background: isValid ? theme.bg : inputValidationStyles.invalidBg,
          }}
        />
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => applyPendingIf()}
          style={{
            flex: 1,
            padding: "5px 8px",
            borderRadius: 5,
            border: "1px solid #94A3B8",
            background: isValid ? "#F1F5F9" : "#F8FAFC",
            color: isValid ? "#334155" : "#94A3B8",
            cursor: isValid ? "pointer" : "not-allowed",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Apply
        </button>
        <button
          onClick={removePendingIf}
          style={{
            flex: 1,
            padding: "5px 8px",
            borderRadius: 5,
            border: "1px solid #CBD5E1",
            background: "#F8FAFC",
            color: "#64748B",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
}

/**
 * Get all connections (control lines) for a given step
 */
function getConnections(circ, nq, step) {
  return collectStepData(circ, nq, step, (g, q) => {
    if (g && g.type === "CNOT_CTRL") {
      return { from: q, to: g.target, color: GATE_DEFS.CNOT.color, type: "CNOT" };
    }
    if (g && g.type === "CZ_CTRL") {
      return { from: q, to: g.target, color: GATE_DEFS.CZ.color, type: "CZ" };
    }
    if (g && g.type === "SWAP_A") {
      return { from: q, to: g.partner, color: GATE_DEFS.SWAP.color, type: "SWAP" };
    }
    return null;
  });
}

/**
 * Get all measurement connections (from qubit to classical bit) for a given step
 */
function getMeasurementConnections(circ, nq, step) {
  return collectStepData(circ, nq, step, (g, q) => {
    if (g && g.type === "M" && g.cbit !== undefined) {
      return { qubit: q, cbit: g.cbit, color: OTHER_OPERATION_BG };
    }
    return null;
  });
}

/**
 * Get all IF connections (from gate to classical wire) for a given step
 */
function getIfConnections(circ, nq, step, theme) {
  return collectStepData(circ, nq, step, (g, q) => {
    if (g && g.type !== "M" && g.if && Number.isInteger(g.if.value) && g.if.anchor === q) {
      return { qubit: q, value: g.if.value, color: OTHER_OPERATION_COLOR };
    }
    return null;
  });
}

/**
 * Renders vertical connection lines between qubits
 */
function ConnectionLines({ circ, nq, nc, ns, pending, hovered, isMobile, CH, CW, LBL_W, theme }) {
  const measurementGateSize = isMobile ? 36 : 42;
  const measurementStartOffset = measurementGateSize / 2;
  const classicalSeparatorHeight = isMobile ? 12 : 16;
  const measurementArrowHeight = 9;
  const ifGateSize = isMobile ? 36 : 42;
  const ifStartOffset = ifGateSize / 2;
  const cnotTargetRadius = (isMobile ? 36 : 42) / 2;

  return (
    <>
      {/* Static connections from circuit */}
      {Array.from({ length: ns }, (_, stepIndex) => {
        const step = stepIndex + 1;
        const connections = getConnections(circ, nq, step);

        return connections.map((c, ci) => {
          const fromY = getCellCenterY(c.from, CH);
          let toY = getCellCenterY(c.to, CH);

          if (c.type === "CNOT") {
            toY += c.to > c.from ? -cnotTargetRadius : cnotTargetRadius;
          }

          const top = Math.min(fromY, toY);
          const bottom = Math.max(fromY, toY);

          return (
            <div
              key={`${step}-${ci}`}
              style={{
                position: "absolute",
                left: getCellCenterX(step, CW, LBL_W) - 1.25,
                top,
                width: 2.5,
                height: bottom - top,
                background: c.color,
                zIndex: 2,
                pointerEvents: "none",
                borderRadius: 1,
              }}
            />
          );
        });
      })}

      {/* Measurement connections from qubits to classical bits */}
      {Array.from({ length: ns }, (_, stepIndex) => {
        const step = stepIndex + 1;
        const measurements = getMeasurementConnections(circ, nq, step);

        return measurements.map((m, mi) => {
          const top = getCellCenterY(m.qubit, CH) + measurementStartOffset;
          const bottom = nq * CH + classicalSeparatorHeight + CH / 2;
          const centerX = getCellCenterX(step, CW, LBL_W);

          return (
            <MeasurementArrow
              key={`m-${step}-${mi}`}
              centerX={centerX}
              top={top}
              bottom={bottom}
              color={m.color}
              measurementArrowHeight={measurementArrowHeight}
            />
          );
        });
      })}

      {/* IF connections from gates to classical wire */}
      {Array.from({ length: ns }, (_, stepIndex) => {
        const step = stepIndex + 1;
        const ifConnections = getIfConnections(circ, nq, step, theme);

        return ifConnections.map((c, ci) => {
          const top = getCellCenterY(c.qubit, CH);
          const classicalY = nq * CH + classicalSeparatorHeight + CH / 2;
          const centerX = getCellCenterX(step, CW, LBL_W);

          return (
            <React.Fragment key={`if-${step}-${ci}`}>
              <div
                style={{
                  position: "absolute",
                  left: centerX - 1,
                  top,
                  width: 2,
                  height: Math.max(0, classicalY - top),
                  background: OTHER_OPERATION_BG,
                  zIndex: 0,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: centerX - 4,
                  top: classicalY - 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: OTHER_OPERATION_BG,
                  zIndex: 4,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: centerX,
                  top: classicalY + 7,
                  transform: "translateX(-50%)",
                  fontSize: isMobile ? 9 : 10,
                  fontWeight: 700,
                  fontFamily: "'Source Code Pro', monospace",
                  color: theme.cvalue,
                  background: "transparent",
                  border: "none",
                  borderRadius: 4,
                  padding: "0px 4px",
                  zIndex: 4,
                  pointerEvents: "none",
                }}
              >
                == {c.value}
              </div>
            </React.Fragment>
          );
        });
      })}

      {/* Pending measurement connection (dashed) */}
      {pending && pending.gate === "M" && (() => {
        const top = getCellCenterY(pending.qubit, CH) + measurementStartOffset;
        const bottom = nq * CH + classicalSeparatorHeight + CH / 2;
        const centerX = getCellCenterX(pending.step, CW, LBL_W);
        const grayColor = OTHER_OPERATION_BG;

        return (
          <MeasurementArrow
            centerX={centerX}
            top={top}
            bottom={bottom}
            color={grayColor}
            measurementArrowHeight={measurementArrowHeight}
          />
        );
      })()}

      {/* Preview connection for pending multi-qubit gate */}
      {pending &&
        ["CNOT", "CZ", "SWAP"].includes(pending.gate) &&
        hovered &&
        hovered.s === pending.step &&
        typeof hovered.q === "number" &&
        hovered.q !== pending.qubit &&
        (() => {
          const fromY = getCellCenterY(pending.qubit, CH);
          let toY = getCellCenterY(hovered.q, CH);
          if (pending.gate === "CNOT") {
            toY += hovered.q > pending.qubit ? -cnotTargetRadius : cnotTargetRadius;
          }
          const top = Math.min(fromY, toY);
          const bottom = Math.max(fromY, toY);
          const gateColor = GATE_DEFS[pending.gate] ? GATE_DEFS[pending.gate].color : "#666";

          return (
            <div
              style={{
                position: "absolute",
                left: getCellCenterX(pending.step, CW, LBL_W) - 1.25,
                top,
                width: 2.5,
                height: bottom - top,
                background: `${gateColor}50`,
                zIndex: 2,
                pointerEvents: "none",
                borderRadius: 1,
              }}
            />
          );
        })()}
    </>
  );
}

/**
 * Main circuit grid component
 */
export function CircuitGrid({
  nq,
  nc,
  ns,
  circ,
  cbits,
  selGate,
  pending,
  hovered,
  handleClick,
  handleCbitClick,
  handleIfInputChange,
  applyPendingIf,
  removePendingIf,
  setHovered,
  isMobile,
  theme,
}) {
  const CH = isMobile ? 48 : 58;
  const CW = isMobile ? 48 : 58;
  const LBL_W = isMobile ? 50 : 63;

  return (
    <div
      style={{
        flex: 1,
        overflow: "auto",
        padding: isMobile ? "12px 8px 8px" : "20px 20px 10px",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ display: "inline-block", minWidth: "100%" }}>
        {/* Step numbers header */}
        <div style={{ display: "flex", marginLeft: LBL_W + 5, marginBottom: 4 }}>
          {Array.from({ length: ns }, (_, stepIndex) => {
            const step = stepIndex + 1;

            return (
            <div
              key={step}
              style={{
                width: CW,
                textAlign: "center",
                fontSize: isMobile ? 8 : 10,
                color: theme.textLight,
                fontFamily: monospaceFontFamily,
                fontWeight: 500,
              }}
            >
              {step}
            </div>
            );
          })}
        </div>

        {/* Circuit grid with connections */}
        <div style={{ position: "relative" }}>
          {/* Qubit wires */}
          {Array.from({ length: nq }, (_, q) => (
            <QubitWire
              key={q}
              q={q}
              ns={ns}
              circ={circ}
              selGate={selGate}
              pending={pending}
              hovered={hovered}
              handleClick={handleClick}
              setHovered={setHovered}
              isMobile={isMobile}
              CH={CH}
              CW={CW}
              LBL_W={LBL_W}
              theme={theme}
            />
          ))}

          {/* Separator between quantum and classical wires */}
          <div style={{ height: isMobile ? 12 : 16 }} />

          {/* Classical bit wire */}
          <ClassicalBitWire
            nc={nc}
            nq={nq}
            ns={ns}
            circ={circ}
            cbits={cbits}
            isMobile={isMobile}
            CH={CH}
            CW={CW}
            LBL_W={LBL_W}
            theme={theme}
          />

          {/* Classical bit selector for pending measurement */}
          <CbitSelector
            nc={nc}
            nq={nq}
            pending={pending}
            handleCbitClick={handleCbitClick}
            isMobile={isMobile}
            CH={CH}
            CW={CW}
            LBL_W={LBL_W}
            theme={theme}
          />

          <IfConditionEditor
            nc={nc}
            nq={nq}
            pending={pending}
            handleIfInputChange={handleIfInputChange}
            applyPendingIf={applyPendingIf}
            removePendingIf={removePendingIf}
            isMobile={isMobile}
            CH={CH}
            CW={CW}
            LBL_W={LBL_W}
            theme={theme}
          />

          {/* Connection lines */}
          <ConnectionLines
            circ={circ}
            nq={nq}
            nc={nc}
            ns={ns}
            pending={pending}
            hovered={hovered}
            isMobile={isMobile}
            CH={CH}
            CW={CW}
            LBL_W={LBL_W}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
}
