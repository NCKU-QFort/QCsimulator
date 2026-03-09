import { useState, useRef } from "react";
import { toPng, toSvg } from "html-to-image";
import { monospaceFontFamily, MAX_CLASSICAL_BITS, MAX_SHOTS, basisLabel } from "./utils.js";
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
 * Download icon
 */
function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * Export menu component
 */
function ExportMenu({ onExportCircuit, onExportData, disabled, theme }) {
  const [showMenu, setShowMenu] = useState(false);
  
  const menuButtonStyle = {
    width: "100%",
    padding: "10px 16px",
    border: "none",
    background: "transparent",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
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
        aria-label="Export"
        title="Export"
      >
        <DownloadIcon />
      </button>

      {showMenu && (
        <>
          <div onClick={() => setShowMenu(false)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} />
          <div style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            right: 0,
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            overflow: "hidden",
            minWidth: 160,
            zIndex: 1000,
          }}>
            {["png", "svg"].map((format) => (
              <button
                key={format}
                onClick={() => {
                  onExportCircuit(format);
                  setShowMenu(false);
                }}
                style={{ ...menuButtonStyle, color: theme.text }}
                onMouseEnter={(e) => (e.target.style.background = theme.hover)}
                onMouseLeave={(e) => (e.target.style.background = "transparent")}
              >
                Export Circuit (.{format})
              </button>
            ))}
            <button
              onClick={() => {
                onExportData();
                setShowMenu(false);
              }}
              disabled={disabled}
              style={{ ...menuButtonStyle, color: disabled ? theme.textLight : theme.text }}
              onMouseEnter={(e) => !disabled && (e.target.style.background = theme.hover)}
              onMouseLeave={(e) => (e.target.style.background = "transparent")}
            >
              Export Data
            </button>
          </div>
        </>
      )}
    </div>
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
  const circuitRef = useRef(null);

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
  const { results, sv, cbits, showSv, chartData, shotsExecuted, shotCounts, isMeasurementResult, run, clear: clearResults, setShowSv } = simulation;

  const isShotsValid = /^\d+$/.test(shotsInput) && Number(shotsInput) >= 1 && Number(shotsInput) <= MAX_SHOTS;

  const addC = () => setNc((n) => Math.min(n + 1, MAX_CLASSICAL_BITS));
  const rmC = () => setNc((n) => Math.max(n - 1, 1));

  const clear = () => {
    clearCircuit();
    clearResults();
  };

  const handleRun = () => {
    if (!isShotsValid) return;
    run(Number(shotsInput));
  };

  const handleExportCircuit = async (format) => {
    if (!circuitRef.current) return;

    try {
      const originalBackground = circuitRef.current.style.background;
      circuitRef.current.style.background = "transparent";

      const exportFn = format === "svg" ? toSvg : toPng;
      const options = format === "svg" 
        ? { backgroundColor: null }
        : { backgroundColor: null, pixelRatio: 2 };

      const dataUrl = await exportFn(circuitRef.current, options);

      circuitRef.current.style.background = originalBackground;

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `circuit-${Date.now()}.${format}`;
      link.click();
    } catch (error) {
      console.error(`Failed to export circuit as ${format.toUpperCase()}:`, error);
      alert("Failed to export circuit. Please try again.");
    }
  };

  const handleExportData = () => {
    if (!results || !shotCounts) {
      alert("No simulation results available. Please run the simulation first.");
      return;
    }

    // Prepare data in the specified format
    const data = {};
    const bitCount = isMeasurementResult ? nc : nq;

    shotCounts.forEach((count, index) => {
      if (count > 0) {
        const label = basisLabel(index, bitCount);
        data[label] = count;
      }
    });

    const exportData = {
      QubitNumber: nq,
      CbitNumber: nc,
      Shots: shotsExecuted,
      data: data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `data-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
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
              : selGate === "M" || selGate === "IF" || selGate === "DEL"
              ? OTHER_OPERATION_BG
              : GATE_DEFS[selGate]?.bg || "#F1F5F9",
          color:
            selGate === "M" || selGate === "IF" || selGate === "DEL"
              ? OTHER_OPERATION_COLOR
              : GATE_DEFS[selGate]?.color || theme.textMid,
          marginRight: 6,
          border:
            selGate === "X"
              ? "none"
              : `1.5px solid ${
                  selGate === "M" || selGate === "IF" || selGate === "DEL"
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
        ) : selGate === "DEL" ? (
          "Del"
        ) : (
          renderGateLabel(GATE_DEFS[selGate]?.label || selGate)
        )}
      </span>
      {selGate === "M"
        ? "Measurement"
        : selGate === "IF"
        ? "Conditional"
        : selGate === "DEL"
        ? "Delete"
        : GATE_DEFS[selGate]?.desc || selGate}{" "}
      selected
    </>
  ) : (
    "Select Operation 選擇操作"
  );

  const isTwoQubitSelected = Boolean(selGate && GATE_DEFS[selGate] && GATE_DEFS[selGate].qubits === 2);
  const isTwoQubitPendingSecond = Boolean(pending && isTwoQubitSelected && pending.gate === selGate);

  let instructionMessage = "Select an operation from the palette";
  if (selGate === "DEL") {
    instructionMessage = "Click any operation in the circuit to remove it";
  } else if (selGate === "IF") {
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
          <div style={{ flex: 1, overflow: "auto", background: theme.bg }}>
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
              circuitRef={circuitRef}
            />
          </div>

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
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <ExportMenu
                onExportCircuit={handleExportCircuit}
                onExportData={handleExportData}
                disabled={!results}
                theme={theme}
              />
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
