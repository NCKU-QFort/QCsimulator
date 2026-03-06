import { theme, btnC } from "../utils.js";

/**
 * Circuit control buttons (Q/S adjusters, Clear, Run)
 */
function CircuitControls({ nq, ns, addQ, rmQ, addS, rmS, clear, run }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
      {/* Qubit count control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          padding: "3px 8px",
          background: theme.bg,
          borderRadius: 6,
          border: `1px solid ${theme.borderLight}`,
        }}
      >
        <span style={{ fontSize: 11, color: theme.textLight, fontWeight: 500 }}>Qubits</span>
        <button onClick={rmQ} style={btnC}>−</button>
        <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, minWidth: 14, textAlign: "center" }}>
          {nq}
        </span>
        <button onClick={addQ} style={btnC}>+</button>
      </div>

      {/* Step count control */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 3,
          padding: "3px 8px",
          background: theme.bg,
          borderRadius: 6,
          border: `1px solid ${theme.borderLight}`,
        }}
      >
        <span style={{ fontSize: 11, color: theme.textLight, fontWeight: 500 }}>Steps</span>
        <button onClick={rmS} style={btnC}>−</button>
        <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, minWidth: 18, textAlign: "center" }}>
          {ns}
        </span>
        <button onClick={addS} style={btnC}>+</button>
      </div>

      {/* Clear button */}
      <button
        onClick={clear}
        style={{
          padding: "5px 10px",
          borderRadius: 6,
          border: `1px solid ${theme.border}`,
          background: theme.surface,
          color: theme.textMid,
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 500,
          fontFamily: "inherit",
        }}
      >
        Clear
      </button>

      {/* Run button */}
      <button
        onClick={run}
        style={{
          padding: "6px 16px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(135deg,#0EA5E9,#6366F1)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "inherit",
          boxShadow: "0 2px 8px rgba(14,165,233,0.3)",
        }}
      >
        {"▶"} Run
      </button>
    </div>
  );
}

/**
 * Application header component
 */
export function Header({ nq, ns, addQ, rmQ, addS, rmS, clear, run, isMobile }) {
  return (
    <div
      style={{
        padding: isMobile ? "10px 12px" : "12px 24px",
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: theme.surface,
        flexShrink: 0,
        gap: 8,
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <img
          src="/src/assets/logo.png"
          alt="Q"
          style={{
            width: 84,
            height: 30,
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: isMobile ? 13 : 15,
              fontWeight: 700,
              color: theme.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Quantum Circuit Simulator
          </div>
          {!isMobile && (
            <div style={{ fontSize: 11, color: theme.textLight }}>
              {"量子電路模擬器"}
            </div>
          )}
        </div>
      </div>

      <CircuitControls
        nq={nq}
        ns={ns}
        addQ={addQ}
        rmQ={rmQ}
        addS={addS}
        rmS={rmS}
        clear={clear}
        run={run}
      />
    </div>
  );
}
