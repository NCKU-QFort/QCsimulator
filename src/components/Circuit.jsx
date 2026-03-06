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
          width: 22,
          height: 22,
          borderRadius: "50%",
          border: `2.5px solid ${GATE_DEFS.CNOT.color}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: GATE_DEFS.CNOT.color,
          fontSize: 15,
          fontWeight: "bold",
          background: theme.surface,
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
  const canPlace = selGate && !hasGate;
  const isPendingTarget = pending && pending.step === s && pending.qubit !== q && !hasGate;

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
          isPendingTarget && isHovered
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

      {/* Preview for measurement */}
      {!hasGate && isHovered && selGate === "M" && !pending && (
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
        q<sub style={{ fontSize: isMobile ? 8 : 10 }}>{q}</sub>{" "}
        <span style={{ color: theme.textLight }}>|0⟩</span>
      </div>

      <div style={{ display: "flex", position: "relative" }}>
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
        {Array.from({ length: ns }, (_, s) => (
          <GateCell
            key={s}
            q={q}
            s={s}
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
 * Renders vertical connection lines between qubits
 */
function ConnectionLines({ circ, nq, ns, pending, hovered, CH, CW, LBL_W }) {
  return (
    <>
      {/* Static connections from circuit */}
      {Array.from({ length: ns }, (_, s) => {
        const connections = getConnections(circ, nq, s);

        return connections.map((c, ci) => {
          const top = Math.min(c.from, c.to) * CH + CH / 2;
          const bottom = Math.max(c.from, c.to) * CH + CH / 2;

          return (
            <div
              key={`${s}-${ci}`}
              style={{
                position: "absolute",
                left: LBL_W + 5 + s * CW + CW / 2 - 1,
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

      {/* Preview connection for pending multi-qubit gate */}
      {pending &&
        hovered &&
        hovered.s === pending.step &&
        hovered.q !== pending.qubit &&
        (() => {
          const top = Math.min(pending.qubit, hovered.q) * CH + CH / 2;
          const bottom = Math.max(pending.qubit, hovered.q) * CH + CH / 2;
          const gateColor = GATE_DEFS[pending.gate] ? GATE_DEFS[pending.gate].color : "#666";

          return (
            <div
              style={{
                position: "absolute",
                left: LBL_W + 5 + pending.step * CW + CW / 2 - 1,
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
export function CircuitGrid({ nq, ns, circ, selGate, pending, hovered, handleClick, setHovered, isMobile }) {
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
          {Array.from({ length: ns }, (_, s) => (
            <div
              key={s}
              style={{
                width: CW,
                textAlign: "center",
                fontSize: isMobile ? 8 : 10,
                color: theme.textLight,
                fontFamily: "'Source Code Pro',monospace",
                fontWeight: 500,
              }}
            >
              {s}
            </div>
          ))}
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

          {/* Connection lines */}
          <ConnectionLines
            circ={circ}
            nq={nq}
            ns={ns}
            pending={pending}
            hovered={hovered}
            CH={CH}
            CW={CW}
            LBL_W={LBL_W}
          />
        </div>
      </div>
    </div>
  );
}
