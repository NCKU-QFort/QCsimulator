import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cAbs2, basisLabelKet, monospaceFontFamily } from "../utils.js";

/**
 * Probability bar chart component
 */
function ProbabilityChart({ chartData, nq, isMobile, shotsExecuted, theme }) {
  return (
    <div style={{ height: isMobile ? 130 : 165 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <XAxis
            dataKey="state"
            tick={{
              fontSize: nq > 4 ? 8 : isMobile ? 9 : 11,
              fill: theme.textMid,
              fontFamily: monospaceFontFamily,
            }}
            interval={0}
            angle={nq > 4 ? -45 : 0}
            textAnchor={nq > 4 ? "end" : "middle"}
            height={nq > 4 ? 45 : 28}
          />
          <YAxis
            tick={{ fontSize: 9, fill: theme.textLight }}
            domain={[0, 1]}
            tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
            width={35}
          />
          <Tooltip
            contentStyle={{
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderRadius: 6,
              fontSize: 11,
              fontFamily: monospaceFontFamily,
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              color: theme.text,
            }}
            labelStyle={{
              color: theme.text,
            }}
            itemStyle={{
              color: theme.text,
            }}
            formatter={(v, name, props) => {
              if (name === "probability") {
                const count = props.payload.count;
                return [`${(v * 100).toFixed(2)}% (${count})`, "Prob"];
              }
              return [v, name];
            }}
          />
          <Bar dataKey="probability" radius={[3, 3, 0, 0]} maxBarSize={isMobile ? 30 : 42}>
            {chartData.map((e, i) => (
              <Cell
                key={i}
                fill={e.probability > 0.5 ? "#3B82F6" : e.probability > 0.1 ? "#6366F1" : "#8B5CF6"}
                fillOpacity={0.82}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * State vector display component
 */
function StateVector({ sv, nq, isMobile, theme }) {
  if (!sv) return null;

  return (
    <div
      style={{
        marginTop: 8,
        padding: 10,
        background: theme.bg,
        borderRadius: 6,
        maxHeight: isMobile ? 100 : 130,
        overflowY: "auto",
        fontFamily: monospaceFontFamily,
        fontSize: isMobile ? 10 : 12,
        border: `1px solid ${theme.borderLight}`,
      }}
    >
      {sv.map((amp, i) => {
        const p = cAbs2(amp);
        if (p < 0.0001) return null;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: isMobile ? 8 : 14,
              padding: "2px 0",
              color: theme.textMid,
            }}
          >
            <span style={{ color: "#3B82F6", minWidth: isMobile ? 50 : 65, fontWeight: 600 }}>
              {basisLabelKet(i, nq)}
            </span>
            <span style={{ color: theme.text }}>
              {amp[0].toFixed(3)}
              {Number.parseFloat(amp[1].toFixed(3)) >= 0 ? "+" : ""}
              {amp[1].toFixed(3)}i
            </span>
            <span style={{ color: theme.textLight }}>{(p * 100).toFixed(1)}%</span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Results panel component showing probabilities and state vector
 */
export function ResultsPanel({ results, sv, cbits, showSv, setShowSv, chartData, nq, nc, isMobile, shotsExecuted, theme, isCollapsed, setIsCollapsed }) {
  if (!results) {
    return (
      <div style={{ fontSize: isMobile ? 12 : 13, color: theme.textLight, textAlign: "center", padding: 6 }}>
        按 <span style={{ color: theme.accent, fontWeight: 600 }}>{"▶"} Run</span> 執行模擬 / Press Run to simulate
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: isCollapsed ? 0 : 8,
          flexWrap: "wrap",
          gap: 6,
          rowGap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              padding: "6px 12px",
              borderRadius: 5,
              border: `1px solid ${theme.border}`,
              background: isCollapsed ? theme.bg : theme.accentBg,
              color: isCollapsed ? theme.textMid : theme.accent,
              cursor: "pointer",
              fontSize: isMobile ? 12 : 13,
              fontWeight: 600,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            aria-label={isCollapsed ? "Expand results" : "Collapse results"}
          >
            {isCollapsed ? "▸ Show" : "▾ Hide"} Results
          </button>

          {!isCollapsed && (
            <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 600, color: theme.text, paddingTop: "6px" }}>
              Probabilities <span style={{ color: theme.textLight, fontWeight: 400, fontSize: 12 }}>— 量測機率</span>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div style={{ fontSize: 11, color: theme.textMid, width: "100%", paddingLeft: 4 }}>
            (% of {shotsExecuted} shots)
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          <ProbabilityChart chartData={chartData} nq={nq} isMobile={isMobile} shotsExecuted={shotsExecuted} theme={theme} />
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => setShowSv(!showSv)}
              style={{
                padding: "3px 10px",
                borderRadius: 5,
                border: `1px solid ${theme.border}`,
                background: showSv ? theme.accentBg : theme.bg,
                color: showSv ? theme.accent : theme.textMid,
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 500,
                fontFamily: "inherit",
              }}
            >
              {showSv ? "▾ Hide" : "▸ Show"} States
            </button>
          </div>
          {showSv && <StateVector sv={sv} nq={nq} isMobile={isMobile} theme={theme} />}
        </>
      )}
    </div>
  );
}
