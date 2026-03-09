import { counterButtonStyle, monospaceFontFamily, inputValidationStyles } from "../utils.js";
import { useTheme } from "./ThemeContext.jsx";
import pkg from "../../package.json";

/**
 * Reusable counter control component: number of qubits, cbits, and steps
 */
function CounterControl({ label, value, onIncrement, onDecrement, theme }) {
  return (
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
      <span style={{ fontSize: 11, color: theme.text, fontWeight: 500 }}>{label}</span>
      <button onClick={onDecrement} style={{ ...counterButtonStyle, background: theme.surface, color: theme.textMid, borderColor: theme.border }}>−</button>
      <span style={{ fontSize: 12, fontWeight: 600, color: theme.text, minWidth: 20, textAlign: "center" }}>
        {value}
      </span>
      <button onClick={onIncrement} style={{ ...counterButtonStyle, background: theme.surface, color: theme.textMid, borderColor: theme.border }}>+</button>
    </div>
  );
}

/**
 * Circuit control buttons (Q/S adjusters, Clear, Run)
 */
function CircuitControls({ nq, nc, ns, shotsInput, setShotsInput, isShotsValid, addQ, rmQ, addC, rmC, addS, rmS, clear, run, theme }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
      <CounterControl label="Qubits" value={nq} onIncrement={addQ} onDecrement={rmQ} theme={theme} />
      <CounterControl label="Cbits" value={nc} onIncrement={addC} onDecrement={rmC} theme={theme} />
      <CounterControl label="Steps" value={ns} onIncrement={addS} onDecrement={rmS} theme={theme} />

      {/* Shots input */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 8px",
          background: theme.bg,
          borderRadius: 6,
          border: `1px solid ${isShotsValid ? theme.borderLight : inputValidationStyles.invalidBorder}`,
        }}
      >
        <span style={{ fontSize: 11, color: theme.text, fontWeight: 500 }}>Shots</span>
        <input
          value={shotsInput}
          onChange={(e) => setShotsInput(e.target.value)}
          inputMode="numeric"
          style={{
            width: 64,
            padding: "2px 6px",
            borderRadius: 4,
            border: `1px solid ${isShotsValid ? theme.border : inputValidationStyles.invalidBorder}`,
            background: isShotsValid ? theme.surface : inputValidationStyles.invalidBg,
            color: isShotsValid ? theme.text : inputValidationStyles.invalidText,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: monospaceFontFamily,
            outline: "none",
          }}
          aria-label="Shots"
        />
      </div>

      {/* Clear button */}
      <button
        onClick={clear}
        style={{
          padding: "5px 10px",
          borderRadius: 6,
          border: `1px solid ${theme.border}`,
          background: theme.surface,
          color: theme.text,
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
        disabled={!isShotsValid}
        style={{
          padding: "6px 16px",
          borderRadius: 6,
          border: "none",
          cursor: isShotsValid ? "pointer" : "not-allowed",
          background: isShotsValid ? "linear-gradient(135deg,#0EA5E9,#6366F1)" : theme.border,
          color: "#fff",
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "inherit",
          boxShadow: isShotsValid ? "0 2px 8px rgba(14,165,233,0.3)" : "none",
          opacity: isShotsValid ? 1 : 0.8,
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
export function Header({ nq, nc, ns, shotsInput, setShotsInput, isShotsValid, addQ, rmQ, addC, rmC, addS, rmS, clear, run, isMobile }) {
  const { theme } = useTheme();
  
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
        <a href="https://qfort.ncku.edu.tw/" target="_blank">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="QFort Logo"
            style={{
              height: 30,
              width: "auto",
              borderRadius: 8,
              flexShrink: 0,
              cursor: "pointer",
            }}
          />
        </a>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: theme.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Quantum Circuit Simulator
          </div>
          <div style={{ fontSize: 14, color: theme.textLight }}>
            量子電路模擬器 <span style={{ marginLeft: 10, fontFamily: monospaceFontFamily }}>ver. {pkg.version}</span>
          </div>
        </div>
      </div>

      <CircuitControls
        nq={nq}
        nc={nc}
        ns={ns}
        shotsInput={shotsInput}
        setShotsInput={setShotsInput}
        isShotsValid={isShotsValid}
        addQ={addQ}
        rmQ={rmQ}
        addC={addC}
        rmC={rmC}
        addS={addS}
        rmS={rmS}
        clear={clear}
        run={run}
        theme={theme}
      />
    </div>
  );
}
