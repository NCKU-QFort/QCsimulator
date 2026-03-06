import { theme, secLbl } from "../utils.js";
import { GATE_DEFS, SINGLE_QUBIT_GATES, MULTI_QUBIT_GATES } from "../gateDefinitions.js";

/**
 * Individual gate button in the palette
 */
function GateButton({ gate, gateKey, selected, onClick, isMobile }) {
  const isMeasurement = gateKey === "M";

  return (
    <button
      onClick={onClick}
      style={
        isMobile
          ? {
              padding: "6px 10px",
              borderRadius: 8,
              border: selected
                ? `2px solid ${isMeasurement ? theme.textMid : gate.color}`
                : `1px solid ${theme.borderLight}`,
              background: selected ? (isMeasurement ? theme.hover : gate.bg) : theme.surface,
              color: isMeasurement ? theme.textMid : gate.color,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 600,
            }
          : {
              width: "100%",
              padding: "7px 10px",
              marginBottom: 3,
              borderRadius: 8,
              border: selected
                ? `2px solid ${isMeasurement ? theme.textMid : gate.color}`
                : "1px solid transparent",
              background: selected ? (isMeasurement ? theme.hover : gate.bg) : "transparent",
              color: theme.text,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "inherit",
              fontSize: 13,
              transition: "all 0.15s",
            }
      }
    >
      <span
        style={{
          width: isMobile ? 26 : 30,
          height: isMobile ? 26 : 30,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: isMobile ? 13 : 14,
          fontFamily: "'Source Code Pro',monospace",
          background: isMeasurement ? "#F1F5F9" : gate.bg,
          color: isMeasurement ? theme.textMid : gate.color,
          flexShrink: 0,
          border: `1.5px solid ${isMeasurement ? theme.border : gate.color}40`,
        }}
      >
        {gate.label}
      </span>
      {!isMobile && (
        <span style={{ fontSize: 12, color: theme.textMid }}>{gate.desc}</span>
      )}
    </button>
  );
}

/**
 * Usage instructions panel
 */
function UsageInstructions() {
  return (
    <div
      style={{
        marginTop: 20,
        padding: 12,
        background: theme.surface,
        borderRadius: 10,
        fontSize: 11.5,
        color: theme.textMid,
        lineHeight: 1.7,
        border: `1px solid ${theme.borderLight}`,
      }}
    >
      <div style={{ fontWeight: 600, color: theme.text, marginBottom: 4, fontSize: 12 }}>
        {"操作說明"} Usage
      </div>
      <div>1. {"選擇"} Gate</div>
      <div>2. {"點擊電路格放置"}</div>
      <div>3. {"雙量子閘需點擊兩個"} Qubit</div>
      <div>4. {"無選擇時點擊可刪除"}</div>
      <div>
        5. {"按"} <span style={{ color: theme.accent, fontWeight: 600 }}>{"▶"} Run</span> {"執行模擬"}
      </div>
    </div>
  );
}

/**
 * Gate palette component for selecting gates
 */
export function GatePalette({ selGate, selectGate, pending, isMobile, showInstructions = true }) {
  return (
    <>
      <div style={secLbl}>Single-Qubit Gates</div>

      <div style={isMobile ? { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 } : {}}>
        {SINGLE_QUBIT_GATES.map((g) => (
          <GateButton
            key={g}
            gate={GATE_DEFS[g]}
            gateKey={g}
            selected={selGate === g}
            onClick={() => selectGate(g)}
            isMobile={isMobile}
          />
        ))}
      </div>

      <div style={{ ...secLbl, marginTop: isMobile ? 4 : 16 }}>Multi-Qubit Gates</div>

      <div style={isMobile ? { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 } : {}}>
        {MULTI_QUBIT_GATES.map((g) => (
          <GateButton
            key={g}
            gate={GATE_DEFS[g]}
            gateKey={g}
            selected={selGate === g}
            onClick={() => selectGate(g)}
            isMobile={isMobile}
          />
        ))}
      </div>

      <div style={{ ...secLbl, marginTop: isMobile ? 4 : 16 }}>Measure</div>

      <div style={isMobile ? { display: "flex", gap: 4 } : {}}>
        <GateButton
          gate={{ label: "M", desc: "Measurement" }}
          gateKey="M"
          selected={selGate === "M"}
          onClick={() => selectGate("M")}
          isMobile={isMobile}
        />
      </div>

      {showInstructions && !isMobile && <UsageInstructions />}

      {pending && !isMobile && (
        <div
          style={{
            marginTop: 10,
            padding: 10,
            background: "#FEF3C7",
            border: "1px solid #F59E0B",
            borderRadius: 8,
            fontSize: 12,
            color: "#92400E",
            lineHeight: 1.5,
          }}
        >
          請點擊同一 Step 的另一個 Qubit
        </div>
      )}
    </>
  );
}
