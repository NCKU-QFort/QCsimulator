import { cAdd, cMul, cAbs2 } from "./utils.js";
import { GATE_DEFS } from "./gateDefinitions.js";

// Measurement error probability: 1% chance to flip 0→1 or 1→0
const MEASUREMENT_ERROR_RATE = 0.01;

/**
 * Apply a single-qubit gate to the quantum state
 * @param {Array} st - Current state vector
 * @param {Array} m - Gate matrix
 * @param {number} q - Target qubit index
 * @param {number} n - Total number of qubits
 * @returns {Array} New state vector
 */
export function applySingleGate(st, m, q, n) {
  const d = 1 << n;
  const ns = st.map((a) => [...a]);
  const mk = 1 << q;

  for (let i = 0; i < d; i++) {
    if ((i & mk) !== 0) continue;

    const j = i | mk;
    ns[i] = cAdd(cMul(m[0][0], st[i]), cMul(m[0][1], st[j]));
    ns[j] = cAdd(cMul(m[1][0], st[i]), cMul(m[1][1], st[j]));
  }

  return ns;
}

/**
 * Apply CNOT gate to the quantum state
 * @param {Array} st - Current state vector
 * @param {number} c - Control qubit index
 * @param {number} t - Target qubit index
 * @param {number} n - Total number of qubits
 * @returns {Array} New state vector
 */
export function applyCNOT(st, c, t, n) {
  const d = 1 << n;
  const ns = st.map((a) => [...a]);

  for (let i = 0; i < d; i++) {
    if (((i >> c) & 1) === 1 && ((i >> t) & 1) === 0) {
      const j = i ^ (1 << t);
      ns[i] = [...st[j]];
      ns[j] = [...st[i]];
    }
  }

  return ns;
}

/**
 * Apply CZ gate to the quantum state
 * @param {Array} st - Current state vector
 * @param {number} c - Control qubit index
 * @param {number} t - Target qubit index
 * @param {number} n - Total number of qubits
 * @returns {Array} New state vector
 */
export function applyCZ(st, c, t, n) {
  const d = 1 << n;
  const ns = st.map((a) => [...a]);

  for (let i = 0; i < d; i++) {
    if (((i >> c) & 1) === 1 && ((i >> t) & 1) === 1) {
      ns[i] = [-st[i][0], -st[i][1]];
    }
  }

  return ns;
}

/**
 * Apply SWAP gate to the quantum state
 * @param {Array} st - Current state vector
 * @param {number} q1 - First qubit index
 * @param {number} q2 - Second qubit index
 * @param {number} n - Total number of qubits
 * @returns {Array} New state vector
 */
export function applySWAP(st, q1, q2, n) {
  const d = 1 << n;
  const ns = st.map((a) => [...a]);

  for (let i = 0; i < d; i++) {
    const b1 = (i >> q1) & 1;
    const b2 = (i >> q2) & 1;

    if (b1 !== b2) {
      const j = i ^ (1 << q1) ^ (1 << q2);
      if (i < j) {
        ns[i] = [...st[j]];
        ns[j] = [...st[i]];
      }
    }
  }

  return ns;
}

/**
 * Perform measurement on a qubit
 * @param {Array} st - State vector
 * @param {number} q - Qubit to measure
 * @param {number} n - Total number of qubits
 * @returns {Object} { state: new collapsed state, result: 0 or 1 }
 */
export function measureQubit(st, q, n) {
  const d = 1 << n;
  
  // Calculate probability of measuring 0
  let prob0 = 0;
  for (let i = 0; i < d; i++) {
    const bit = (i >> q) & 1;
    if (bit === 0) {
      prob0 += cAbs2(st[i]);
    }
  }

  // Random measurement based on probability
  const result = Math.random() < prob0 ? 0 : 1;

  // Collapse state vector
  const ns = st.map(() => [0, 0]);
  let norm = 0;

  for (let i = 0; i < d; i++) {
    const bit = (i >> q) & 1;
    if (bit === result) {
      ns[i] = [...st[i]];
      norm += cAbs2(st[i]);
    }
  }

  // Normalize the collapsed state
  const normFactor = Math.sqrt(norm);
  if (normFactor > 1e-10) {
    for (let i = 0; i < d; i++) {
      ns[i][0] /= normFactor;
      ns[i][1] /= normFactor;
    }
  }

  return { state: ns, result };
}

/**
 * Run the quantum circuit simulation
 * @param {number} nq - Number of qubits
 * @param {number} nc - Number of classical bits
 * @param {Object} circ - Circuit configuration
 * @param {number} ns - Number of steps
 * @returns {Object} { state: final state vector, cbits: classical bit values }
 */
export function runSim(nq, nc, circ, ns) {
  const d = 1 << nq;
  let st = Array.from({ length: d }, (_, i) => (i === 0 ? [1, 0] : [0, 0]));
  const cbits = Array(nc).fill(0); // Classical bits initialized to 0

  for (let s = 1; s <= ns; s++) {
    const pr = new Set();

    for (let q = 0; q < nq; q++) {
      const k = `${q}-${s}`;
      if (pr.has(k)) continue;

      const g = circ[k];
      if (!g) continue;

      if (g.type === "M" && g.cbit !== undefined) {
        // Perform measurement
        const measurement = measureQubit(st, q, nq);
        st = measurement.state;
        
        // Apply measurement error: 0.5% chance to flip the result
        let result = measurement.result;
        if (Math.random() < MEASUREMENT_ERROR_RATE) {
          result = result === 0 ? 1 : 0;
        }
        cbits[g.cbit] = result;
      } else if (g.type === "CNOT_CTRL") {
        st = applyCNOT(st, q, g.target, nq);
        pr.add(`${g.target}-${s}`);
      } else if (g.type === "CZ_CTRL") {
        st = applyCZ(st, q, g.target, nq);
        pr.add(`${g.target}-${s}`);
      } else if (g.type === "SWAP_A") {
        st = applySWAP(st, q, g.partner, nq);
        pr.add(`${g.partner}-${s}`);
      } else if (["CNOT_TGT", "CZ_TGT", "SWAP_B"].includes(g.type)) {
        continue;
      } else if (GATE_DEFS[g.type]) {
        st = applySingleGate(st, GATE_DEFS[g.type].matrix, q, nq);
      }

      pr.add(k);
    }
  }

  return { state: st, cbits };
}
