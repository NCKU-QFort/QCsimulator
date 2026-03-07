import React from "react";
import { theme } from "../utils.js";
import { GATE_DEFS } from "../gateDefinitions.js";

/**
 * Renders a quantum gate visual representation
 */
function GateRenderer({ gate, isMobile }) {
  if (!gate) return null;

  const t = gate.type;
  const sz = isMobile ? 36 : 42;

  if (t === "CNOT_CTRL") {
    return (
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: GATE_DEFS.CNOT.color,
          boxShadow: `0 0 0 2px ${theme.surface}`,
        }}
      />
    );
  }

  if (t === "CNOT_TGT") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: GATE_DEFS.CNOT.color,
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        {"⊕"}
      </div>
    );
  }

  if (t === "CZ_CTRL" || t === "CZ_TGT") {
    return (
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: GATE_DEFS.CZ.color,
          boxShadow: `0 0 0 2px ${theme.surface}`,
        }}
      />
    );
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
          background: theme.surface,
          border: `2px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
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
        fontFamily: "'Source Code Pro',monospace",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {def.label}
    </div>
  );
}

/**
 * Individual gate cell in the circuit grid
 */
function GateCell({ q, s, circ, selGate, pending, hovered, handleClick, setHovered, isMobile, CH, CW }) {
  const gate = circ[`${q}-${s}`];
  const isHovered = hovered && hovered.q === q && hovered.s === s;
  const hasGate = Boolean(gate);
  const isMeasurementStepOccupied =
    selGate === "M" &&
    Object.entries(circ).some(([key, value]) => {
      if (value.type !== "M") return false;
      const step = Number.parseInt(key.split("-")[1], 10);
      return step === s;
    });
  const canPlace = selGate && !hasGate && !(selGate === "M" && isMeasurementStepOccupied);
  const isPendingTarget = pending && pending.step === s && pending.qubit !== q && !hasGate;
  const isPendingSource =
    pending &&
    pending.step === s &&
    pending.qubit === q &&
    !hasGate &&
    GATE_DEFS[pending.gate] &&
    GATE_DEFS[pending.gate].qubits === 2;
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
        cursor: canPlace || isPendingTarget || (!selGate && hasGate) ? "pointer" : "default",
        background:
          showPendingTargetPreview
            ? "#3B82F612"
            : isHovered && (canPlace || (!selGate && hasGate))
              ? theme.hover
              : "transparent",
        borderRadius: 5,
        transition: "background 0.1s",
      }}
    >
      <GateRenderer gate={gate} isMobile={isMobile} />

      {/* Preview for single-qubit gate */}
      {!hasGate &&
        isHovered &&
        selGate &&
        !pending &&
        GATE_DEFS[selGate] &&
        GATE_DEFS[selGate].qubits === 1 && (
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
              fontFamily: "'Source Code Pro',monospace",
            }}
          >
            {GATE_DEFS[selGate].label}
          </div>
        )}

      {/* Preview for multi-qubit gate control/first qubit */}
      {!hasGate &&
        isHovered &&
        selGate &&
        !pending &&
        GATE_DEFS[selGate] &&
        GATE_DEFS[selGate].qubits === 2 && (() => {
          const gateColor = GATE_DEFS[selGate].color;
          
          if (selGate === "CNOT") {
            return (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: `2px dashed ${gateColor}80`,
                  background: `${gateColor}40`,
                }}
              />
            );
          } else if (selGate === "CZ") {
            return (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  border: `2px dashed ${gateColor}80`,
                  background: `${gateColor}40`,
                }}
              />
            );
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
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
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
            border: `2px dashed ${theme.textLight}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.textLight,
            fontWeight: 700,
            fontSize: 13,
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
          return (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: `${gateColor}80`,
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              {"⊕"}
            </div>
          );
        } else if (gateType === "CZ") {
          return (
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                border: `2px dashed ${gateColor}80`,
              }}
            />
          );
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
function QubitWire({ q, ns, circ, selGate, pending, hovered, handleClick, setHovered, isMobile, CH, CW, LBL_W }) {
  return (
    <div style={{ display: "flex", alignItems: "center", height: CH }}>
      <div
        style={{
          width: LBL_W,
          textAlign: "right",
          paddingRight: 6,
          fontFamily: "'Source Code Pro',monospace",
          fontSize: isMobile ? 11 : 13,
          color: theme.textMid,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        q<sub style={{ fontSize: isMobile ? 8 : 10 }}>{q}</sub>
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
function ClassicalBitWire({ nc, nq, ns, circ, cbits, isMobile, CH, CW, LBL_W }) {
  const measurementColor = "#888";

  return (
    <div style={{ display: "flex", alignItems: "center", height: CH }}>
      <div
        style={{
          width: LBL_W,
          textAlign: "right",
          paddingRight: 6,
          fontFamily: "'Source Code Pro',monospace",
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
                    left: "calc(50% + 7px)",
                    top: isMobile ? 4 : 5,
                    transform: "translateX(-50%)",
                  }}
                >
                  <div style={{ color: measurementColor, fontWeight: 600 }}>
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
function CbitSelector({ nc, nq, pending, handleCbitClick, isMobile, CH, CW, LBL_W }) {
  if (!pending || pending.gate !== "M") return null;

  const left = LBL_W + 5 + (pending.step - 1) * CW;
  const top = pending.qubit * CH + CH + 10;
  const grayColor = "#888";

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        background: theme.surface,
        border: `2px solid ${grayColor}`,
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
              border: `1.5px solid ${grayColor}`,
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
 * Get all connections (control lines) for a given step
 */
function getConnections(circ, nq, step) {
  const connections = [];

  for (let q = 0; q < nq; q++) {
    const g = circ[`${q}-${step}`];

    if (g && g.type === "CNOT_CTRL") {
      connections.push({ from: q, to: g.target, color: GATE_DEFS.CNOT.color });
    }

    if (g && g.type === "CZ_CTRL") {
      connections.push({ from: q, to: g.target, color: GATE_DEFS.CZ.color });
    }

    if (g && g.type === "SWAP_A") {
      connections.push({ from: q, to: g.partner, color: GATE_DEFS.SWAP.color });
    }
  }

  return connections;
}

/**
 * Get all measurement connections (from qubit to classical bit) for a given step
 */
function getMeasurementConnections(circ, nq, step) {
  const measurements = [];

  for (let q = 0; q < nq; q++) {
    const g = circ[`${q}-${step}`];

    if (g && g.type === "M" && g.cbit !== undefined) {
      measurements.push({ qubit: q, cbit: g.cbit, color: "#888" });
    }
  }

  return measurements;
}

/**
 * Renders vertical connection lines between qubits
 */
function ConnectionLines({ circ, nq, nc, ns, pending, hovered, isMobile, CH, CW, LBL_W }) {
  const measurementGateSize = isMobile ? 36 : 42;
  const measurementStartOffset = measurementGateSize / 2;
  const classicalSeparatorHeight = isMobile ? 12 : 16;
  const measurementArrowHeight = 9;

  return (
    <>
      {/* Static connections from circuit */}
      {Array.from({ length: ns }, (_, stepIndex) => {
        const step = stepIndex + 1;
        const connections = getConnections(circ, nq, step);

        return connections.map((c, ci) => {
          const top = Math.min(c.from, c.to) * CH + CH / 2;
          const bottom = Math.max(c.from, c.to) * CH + CH / 2;

          return (
            <div
              key={`${step}-${ci}`}
              style={{
                position: "absolute",
                left: LBL_W + 5 + (step - 1) * CW + CW / 2 - 1,
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
          // Connection goes from qubit to classical bit wire
          const top = m.qubit * CH + CH / 2 + measurementStartOffset;
          // Classical bit wire is positioned after all qubits
          const bottom = nq * CH + classicalSeparatorHeight + CH / 2;
          const centerX = LBL_W + 5 + (step - 1) * CW + CW / 2;

          return (
            <React.Fragment key={`m-${step}-${mi}`}>
              {/* Dashed line */}
              <div
                style={{
                  position: "absolute",
                  left: centerX - 1,
                  top,
                  width: 2.5,
                  height: Math.max(0, bottom - top - measurementArrowHeight),
                  background: "transparent",
                  borderLeft: `2.5px dashed ${m.color}`,
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />
              {/* Arrowhead pointing to classical wire */}
              <div
                style={{
                  position: "absolute",
                  left: centerX - 6,
                  top: bottom - measurementArrowHeight,
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: `9px solid ${m.color}`,
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              />
            </React.Fragment>
          );
        });
      })}

      {/* Pending measurement connection (dashed) */}
      {pending && pending.gate === "M" && (() => {
        const top = pending.qubit * CH + CH / 2 + measurementStartOffset;
        const bottom = nq * CH + classicalSeparatorHeight + CH / 2;
        const centerX = LBL_W + 5 + (pending.step - 1) * CW + CW / 2;
        const grayColor = "#888";

        return (
          <>
            {/* Dashed line */}
            <div
              style={{
                position: "absolute",
                left: centerX - 1,
                top,
                width: 2.5,
                height: Math.max(0, bottom - top - measurementArrowHeight),
                background: "transparent",
                borderLeft: `2.5px dashed ${grayColor}`,
                zIndex: 2,
                pointerEvents: "none",
              }}
            />
            {/* Arrowhead pointing to classical wire */}
            <div
              style={{
                position: "absolute",
                left: centerX - 6,
                top: bottom - measurementArrowHeight,
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: `9px solid ${grayColor}`,
                zIndex: 3,
                pointerEvents: "none",
              }}
            />
          </>
        );
      })()}

      {/* Preview connection for pending multi-qubit gate */}
      {pending &&
        hovered &&
        hovered.s === pending.step &&
        typeof hovered.q === "number" &&
        hovered.q !== pending.qubit &&
        (() => {
          const top = Math.min(pending.qubit, hovered.q) * CH + CH / 2;
          const bottom = Math.max(pending.qubit, hovered.q) * CH + CH / 2;
          const gateColor = GATE_DEFS[pending.gate] ? GATE_DEFS[pending.gate].color : "#666";

          return (
            <div
              style={{
                position: "absolute",
                left: LBL_W + 5 + (pending.step - 1) * CW + CW / 2 - 1,
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
export function CircuitGrid({ nq, nc, ns, circ, cbits, selGate, pending, hovered, handleClick, handleCbitClick, setHovered, isMobile }) {
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
                fontFamily: "'Source Code Pro',monospace",
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
          />
        </div>
      </div>
    </div>
  );
}
