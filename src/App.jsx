import { useState } from "react";
import { monospaceFontFamily } from "./utils.js";
import { useTheme } from "./components/ThemeContext.jsx";
import { GATE_DEFS, OTHER_OPERATION_COLOR, OTHER_OPERATION_BG, OTHER_OPERATION_BORDER } from "./gateDefinitions.js";
import { useIsMobile } from "./hooks/useIsMobile.js";
import { useCircuitState } from "./hooks/useCircuitState.js";
import { useSimulation } from "./hooks/useSimulation.js";
import { Header } from "./components/Header.jsx";
import { GatePalette } from "./components/GatePalette.jsx";
import { renderGateLabel } from "./components/CircuitHelpers.jsx";
import { CircuitGrid } from "./components/Circuit.jsx";
import { ResultsPanel } from "./components/Results.jsx";
import { PlusCircle } from "./components/CircuitHelpers.jsx";

/**
 * Sun icon for light mode
 */
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

/**
 * Moon icon for dark mode
 */
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

/**
 * Theme switcher button component
 */
function ThemeSwitcher() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: `1px solid ${theme.border}`,
        background: theme.surface,
        color: theme.text,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default function App() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [showPalette, setShowPalette] = useState(false);
  const [nc, setNc] = useState(2); // Number of classical bits
  const [shotsInput, setShotsInput] = useState("1000");

  const circuitState = useCircuitState(nc);
  const {
    nq,
    ns,
    circ,
    selGate,
    pending,
    hovered,
    addQ,
    rmQ,
    addS,
    rmS,
    clear: clearCircuit,
    selectGate,
    handleClick,
    handleCbitClick,
    handleIfInputChange,
    applyPendingIf,
    removePendingIf,
    setHovered,
  } = circuitState;

  const simulation = useSimulation(nq, nc, circ, ns);
  const { results, sv, cbits, showSv, chartData, shotsExecuted, run, clear: clearResults, setShowSv } = simulation;

  const isShotsValid = /^\d+$/.test(shotsInput) && Number(shotsInput) >= 1 && Number(shotsInput) <= 100000;

  const addC = () => setNc((n) => Math.min(n + 1, 20));
  const rmC = () => setNc((n) => Math.max(n - 1, 1));

  const clear = () => {
    clearCircuit();
    clearResults();
  };

  const handleRun = () => {
    if (!isShotsValid) return;
    run(Number(shotsInput));
  };

  const selectedOperationMessage = selGate ? (
    <>
      <span
        style={{
          display: "inline-flex",
          width: 22,
          height: 22,
          borderRadius: 4,
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          fontSize: 12,
          fontFamily: monospaceFontFamily,
          background:
            selGate === "X"
              ? "transparent"
              : selGate === "M" || selGate === "IF"
              ? OTHER_OPERATION_BG
              : GATE_DEFS[selGate]?.bg || "#F1F5F9",
          color:
            selGate === "M" || selGate === "IF"
              ? OTHER_OPERATION_COLOR
              : GATE_DEFS[selGate]?.color || theme.textMid,
          marginRight: 6,
          border:
            selGate === "X"
              ? "none"
              : `1.5px solid ${
                  selGate === "M"
                    ? OTHER_OPERATION_BORDER
                    : selGate === "IF"
                    ? OTHER_OPERATION_BORDER
                    : (GATE_DEFS[selGate]?.color || theme.border)
                }40`,
          verticalAlign: "middle",
        }}
      >
        {selGate === "X" ? (
          <PlusCircle size={20} color={GATE_DEFS.X.color} />
        ) : selGate === "M" ? (
          "M"
        ) : selGate === "IF" ? (
          "if"
        ) : (
          renderGateLabel(GATE_DEFS[selGate]?.label || selGate)
        )}
      </span>
      {selGate === "M"
        ? "Measurement"
        : selGate === "IF"
        ? "Conditional"
        : GATE_DEFS[selGate]?.desc || selGate}{" "}
      selected
    </>
  ) : (
    "Select Operation 選擇操作"
  );

  const isTwoQubitSelected = Boolean(selGate && GATE_DEFS[selGate] && GATE_DEFS[selGate].qubits === 2);
  const isTwoQubitPendingSecond = Boolean(pending && isTwoQubitSelected && pending.gate === selGate);

  let instructionMessage = "Click any operation in the circuit to remove it";
  if (selGate === "IF") {
    instructionMessage = "Choose a gate in the circuit to modify if-condition";
  } else if (selGate === "M" || (selGate && GATE_DEFS[selGate] && GATE_DEFS[selGate].qubits === 1)) {
    instructionMessage = "Choose a position in the circuit to apply the operation";
  } else if (isTwoQubitSelected && !isTwoQubitPendingSecond) {
    instructionMessage = "Choose a position for the first qubit";
  } else if (isTwoQubitPendingSecond) {
    instructionMessage = "Choose the second qubit in the same step";
  }

  return (
    <div
      style={{
        height: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: "'DM Sans','Segoe UI',sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Source+Code+Pro:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:5px;height:5px;}
        ::-webkit-scrollbar-track{background:${theme.bg};}
        ::-webkit-scrollbar-thumb{background:${theme.border};border-radius:3px;}
        button:active{transform:scale(0.97);}
        a{color:#4B92F6;text-decoration:none;}
        a:hover{text-decoration:underline;}
      `}</style>

      {/* Header */}
      <Header
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
        run={handleRun}
        isMobile={isMobile}
      />

      {/* Mobile: Gate Toggle Bar */}
      {isMobile && (
        <div style={{ borderBottom: `1px solid ${theme.border}`, background: theme.sidebar, flexShrink: 0 }}>
          <button
            onClick={() => setShowPalette(!showPalette)}
            style={{
              width: "100%",
              height: 40,
              padding: "0 12px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "inherit",
              fontSize: 13,
              color: theme.text,
              fontWeight: 500,
            }}
          >
            <span
              style={{
                flex: 1,
                minWidth: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedOperationMessage}
            </span>

            <span style={{ fontSize: 10, color: theme.textLight }}>
              {showPalette ? "▲" : "▼"}
            </span>
          </button>

          {showPalette && (
            <div style={{ padding: "8px 12px 12px", maxHeight: 220, overflow: "hidden" }}>
              <div
                style={{
                  maxHeight: 200,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  paddingRight: 2,
                }}
              >
              <GatePalette
                selGate={selGate}
                selectGate={selectGate}
                pending={pending}
                isMobile={isMobile}
                showInstructions={false}
                theme={theme}
              />
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <div
            style={{
              width: 180,
              borderRight: `1px solid ${theme.border}`,
              padding: "16px 12px",
              background: theme.sidebar,
              flexShrink: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
                overscrollBehavior: "contain",
                paddingRight: 2,
              }}
            >
              <GatePalette
                selGate={selGate}
                selectGate={selectGate}
                pending={pending}
                isMobile={isMobile}
                showInstructions={true}
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* Main Area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Desktop: selected operation message */}
          {!isMobile && (
            <div
              style={{
                borderBottom: `1px solid ${theme.border}`,
                background: theme.sidebar,
                height: 40,
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                fontSize: 13,
                color: theme.text,
                fontWeight: 500,
                flexShrink: 0,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {selectedOperationMessage}
            </div>
          )}

          <div
            style={{
              width: "100%",
              height: 34,
              padding: "0 12px",
              background: theme.instructionBg,
              borderBottom: `1px solid ${theme.instructionBorder}`,
              color: theme.instructionText,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              fontSize: 12,
              fontWeight: 500,
              flexShrink: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={instructionMessage}
          >
            {instructionMessage}
          </div>

          {/* Circuit Grid */}
          <CircuitGrid
            nq={nq}
            nc={nc}
            ns={ns}
            circ={circ}
            cbits={cbits}
            selGate={selGate}
            pending={pending}
            hovered={hovered}
            handleClick={handleClick}
            handleCbitClick={handleCbitClick}
            handleIfInputChange={handleIfInputChange}
            applyPendingIf={applyPendingIf}
            removePendingIf={removePendingIf}
            setHovered={setHovered}
            isMobile={isMobile}
            theme={theme}
          />

          {/* Results Panel */}
          <div
            style={{
              borderTop: `1px solid ${theme.border}`,
              background: theme.surface,
              padding: isMobile ? "10px 12px" : "14px 24px",
              flexShrink: 0,
              minHeight: results ? (isMobile ? 220 : 270) : 44,
              transition: "min-height 0.3s",
            }}
          >
            <ResultsPanel
              results={results}
              sv={sv}
              cbits={cbits}
              showSv={showSv}
              setShowSv={setShowSv}
              chartData={chartData}
              nq={nq}
              nc={nc}
              isMobile={isMobile}
              shotsExecuted={shotsExecuted}
              theme={theme}
            />
          </div>

          {/* Footer */}
          <div
            style={{
              borderTop: `1px solid ${theme.border}`,
              background: theme.surface,
              padding: isMobile ? "12px" : "16px 24px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: isMobile ? 10 : 11,
              color: theme.textLight,
              lineHeight: 1.6,
              gap: 16,
            }}
          >
            <div style={{ textAlign: "left", flex: 1 }}>
              <div>Copyright © 2026 <a href="https://qfort.ncku.edu.tw/">Center for Quantum Frontiers of Research & Technology (QFort)</a>, All Rights Reserved.</div>
              <div>Designed by Yi-Te Huang and Po-Chen Kuo</div>
            </div>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
