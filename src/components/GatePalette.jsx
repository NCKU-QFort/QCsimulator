import { useState } from "react";
import { OperationSectionLabelStyle, monospaceFontFamily } from "../utils.js";
import {
  GATE_DEFS,
  SINGLE_QUBIT_GATES,
  MULTI_QUBIT_GATES,
  OTHER_OPERATION_COLOR,
  OTHER_OPERATION_BG,
  OTHER_OPERATION_HOVER_BG,
  OTHER_OPERATION_BORDER,
} from "../gateDefinitions.js";
import { PlusCircle, getOperationColors, renderGateLabel } from "./CircuitHelpers.jsx";

/**
 * Individual gate button in the palette
 */
function GateButton({ gate, gateKey, selected, onClick, isMobile, theme }) {
  const isMeasurement = gateKey === "M";
  const isConditional = gateKey === "IF";
  const isDelete = gateKey === "DEL";
  const isOtherOperation = isMeasurement || isConditional || isDelete;
  const isXGate = gateKey === "X";
  const [isHovered, setIsHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={
        isMobile
          ? {
              padding: 0,
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontFamily: "inherit",
            }
          : {
              width: "100%",
              padding: "7px 10px",
              marginBottom: 3,
              borderRadius: 8,
              border: isHovered && !selected
                ? `1px solid ${isOtherOperation ? OTHER_OPERATION_BORDER : gate.color}60`
                : selected
                ? `2px solid ${isOtherOperation ? OTHER_OPERATION_BORDER : gate.color}`
                : "1px solid transparent",
              background: selected
                ? isOtherOperation ? theme.hover : gate.bg
                : isHovered
                ? `${isOtherOperation ? OTHER_OPERATION_BORDER : gate.color}15`
                : "transparent",
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
          fontFamily: monospaceFontFamily,
          background: isXGate
            ? "transparent"
            : isOtherOperation
            ? (isHovered ? OTHER_OPERATION_HOVER_BG : OTHER_OPERATION_BG)
            : (isHovered ? `${gate.color}20` : gate.bg),
          color: isOtherOperation ? OTHER_OPERATION_COLOR : gate.color,
          flexShrink: 0,
          border: isXGate
            ? "none"
            : `1.5px solid ${isOtherOperation ? OTHER_OPERATION_BORDER : gate.color}${isHovered ? "60" : "40"}`,
          transition: "all 0.15s",
        }}
      >
        {isXGate ? (
          <PlusCircle size={isMobile ? 24 : 28} color={gate.color} />
        ) : (
          renderGateLabel(gate.label)
        )}
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
function UsageInstructions({ expanded, onToggle, theme }) {
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
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          padding: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          color: theme.text,
          fontWeight: 600,
          fontSize: 12,
          fontFamily: "inherit",
          marginBottom: expanded ? 4 : 0,
        }}
      >
        <span>Instructions {"說明"}</span>
        <span style={{ color: theme.textLight, fontSize: 10 }}>{expanded ? "▲" : "▼"}</span>
      </button>

      {expanded && (
        <>
          <div>1. {"選擇下方操作"}</div>
          <div>2. {"點擊電路格放置操作"}</div>
          <div>3. {"未選擇操作時點擊電路格可刪除操作"}</div>
          <div>
            4. {"按"} <span style={{ color: theme.accent, fontWeight: 600 }}>{"▶"} Run</span> {"執行模擬"}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Gate palette component for selecting gates
 */
export function GatePalette({ selGate, selectGate, pending, isMobile, showInstructions = true, theme }) {
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  return (
    <>
      {showInstructions && !isMobile && (
        <UsageInstructions
          expanded={instructionsExpanded}
          onToggle={() => setInstructionsExpanded((v) => !v)}
          theme={theme}
        />
      )}

      <div style={{
        fontSize: 12,
        fontWeight: 600,
        color: theme.text,
        letterSpacing: "0.05em",
        marginTop: showInstructions ? 16 : 0,
        marginBottom: 10,
      }}>
        Operations 操作 :
      </div>

      <div style={{...OperationSectionLabelStyle, marginTop: 0}}>Single-Qubit Gates</div>

      <div style={isMobile ? { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 } : {}}>
        {SINGLE_QUBIT_GATES.map((g) => (
          <GateButton
            key={g}
            gate={GATE_DEFS[g]}
            gateKey={g}
            selected={selGate === g}
            onClick={() => selectGate(g)}
            isMobile={isMobile}
            theme={theme}
          />
        ))}
      </div>

      <div style={{ ...OperationSectionLabelStyle, marginTop: isMobile ? 4 : 16 }}>Multi-Qubit Gates</div>

      <div style={isMobile ? { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 } : {}}>
        {MULTI_QUBIT_GATES.map((g) => (
          <GateButton
            key={g}
            gate={GATE_DEFS[g]}
            gateKey={g}
            selected={selGate === g}
            onClick={() => selectGate(g)}
            isMobile={isMobile}
            theme={theme}
          />
        ))}
      </div>

      <div style={{ ...OperationSectionLabelStyle, marginTop: isMobile ? 4 : 16 }}>Other Operations</div>

      <div style={isMobile ? { display: "flex", gap: 4 } : {}}>
        <GateButton
          gate={{ label: "Del", desc: "Delete" }}
          gateKey="DEL"
          selected={selGate === "DEL"}
          onClick={() => selectGate("DEL")}
          isMobile={isMobile}
          theme={theme}
        />
        <GateButton
          gate={{ label: "M", desc: "Measurement" }}
          gateKey="M"
          selected={selGate === "M"}
          onClick={() => selectGate("M")}
          isMobile={isMobile}
          theme={theme}
        />
        <GateButton
          gate={{ label: "if", desc: "Conditional" }}
          gateKey="IF"
          selected={selGate === "IF"}
          onClick={() => selectGate("IF")}
          isMobile={isMobile}
          theme={theme}
        />
      </div>
    </>
  );
}
