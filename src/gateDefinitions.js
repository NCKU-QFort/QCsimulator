const S2 = 1 / Math.sqrt(2);
const HALF = 0.5;

// Gate categories for UI display
// note that the order of gates in these arrays determines their order in the palette
export const SINGLE_QUBIT_GATES = ["H", "X", "I", "Z", "S", "Sdg", "T", "Tdg", "SX", "SXdg", "Y"];
export const MULTI_QUBIT_GATES = ["CNOT", "SWAP", "CZ"];

// Reusable operation category colors (M, IF)
export const OTHER_OPERATION_COLOR = "#000000";
export const OTHER_OPERATION_BG = "#A2A9B0";
export const OTHER_OPERATION_HOVER_BG = "#929AA0";
export const OTHER_OPERATION_BORDER = "#828990";

export const PHASE_GATE_COLOR = "#0D9488";
export const PHASE_GATE_BG = "#F0FDFA";

export const HADAMARD_GATE_COLOR = "#DC2626";
export const HADAMARD_GATE_BG = "#FEF2F2";

export const LOGICAL_GATE_COLOR = "#2563EB";
export const LOGICAL_GATE_BG = "#EFF6FF";

export const OTHER_GATE_COLOR = "#7C3AED";
export const OTHER_GATE_BG = "#F5F3FF";

export const GATE_DEFS = {
  I: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0], // 0 + 0i = 0
        [1, 0], // 1 + 0i = 1
      ],
    ],
    label: "I",
    color: LOGICAL_GATE_COLOR,
    bg: LOGICAL_GATE_BG,
    desc: "Identity",
    qubits: 1,
  },
  H: {
    matrix: [
      [
        [S2, 0],  // 1/√2 + 0i
        [S2, 0],  // 1/√2 + 0i
      ],
      [
        [S2, 0],  //  1/√2 + 0i
        [-S2, 0], // -1/√2 + 0i
      ],
    ],
    label: "H",
    color: HADAMARD_GATE_COLOR,
    bg: HADAMARD_GATE_BG,
    desc: "Hadamard",
    qubits: 1,
  },
  X: {
    matrix: [
      [
        [0, 0], // 0 + 0i = 0
        [1, 0], // 1 + 0i = 1
      ],
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
    ],
    label: "⊕",
    color: LOGICAL_GATE_COLOR,
    bg: LOGICAL_GATE_BG,
    desc: "Pauli-X",
    qubits: 1,
  },
  SX: {
    matrix: [
      [
        [HALF,  HALF],  // (1 + i)/2
        [HALF, -HALF],  // (1 - i)/2
      ],
      [
        [HALF, -HALF],  // (1 - i)/2
        [HALF,  HALF],  // (1 + i)/2
      ],
    ],
    label: "√X",
    color: OTHER_GATE_COLOR,
    bg: OTHER_GATE_BG,
    desc: "SX",
    qubits: 1,
  },
  SXdg: {
    matrix: [
      [
        [HALF, -HALF],  // (1 - i)/2
        [HALF,  HALF],  // (1 + i)/2
      ],
      [
        [HALF,  HALF],  // (1 + i)/2
        [HALF, -HALF],  // (1 - i)/2
      ],
    ],
    label: "√X†",
    color: OTHER_GATE_COLOR,
    bg: OTHER_GATE_BG,
    desc: "SXdg",
    qubits: 1,
  },
  Y: {
    matrix: [
      [
        [0, 0],  // 0 + 0i =  0
        [0, -1], // 0 - 1i = -i
      ],
      [
        [0, 1],  // 0 + 1i =  i
        [0, 0],  // 0 + 0i =  0
      ],
    ],
    label: "Y",
    color: OTHER_GATE_COLOR,
    bg: OTHER_GATE_BG,
    desc: "Pauli-Y",
    qubits: 1,
  },
  Z: {
    matrix: [
      [
        [1, 0],  // 1 + 0i = 1
        [0, 0],  // 0 + 0i = 0
      ],
      [
        [0, 0],  //  0 + 0i =  0
        [-1, 0], // -1 + 0i = -1
      ],
    ],
    label: "Z",
    color: PHASE_GATE_COLOR,
    bg: PHASE_GATE_BG,
    desc: "Pauli-Z",
    qubits: 1,
  },
  S: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0], // 0 + 0i = 0
        [0, 1], // 0 + 1i = i
      ],
    ],
    label: "S",
    color: PHASE_GATE_COLOR,
    bg: PHASE_GATE_BG,
    desc: "Phase(π/2)",
    qubits: 1,
  },
  Sdg: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0],  // 0 + 0i =  0
        [0, -1], // 0 - 1i = -i
      ],
    ],
    label: "S†",
    color: PHASE_GATE_COLOR,
    bg: PHASE_GATE_BG,
    desc: "Phase(-π/2)",
    qubits: 1,
  },
  T: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0], // 0 + 0i = 0
        [Math.cos(Math.PI / 4), Math.sin(Math.PI / 4)], // exp(iπ/4) = cos(π/4) + i*sin(π/4)
      ],
    ],
    label: "T",
    color: PHASE_GATE_COLOR,
    bg: PHASE_GATE_BG,
    desc: "Phase(π/4)",
    qubits: 1,
  },
  Tdg: {
    matrix: [
      [
        [1, 0], // 1 + 0i = 1
        [0, 0], // 0 + 0i = 0
      ],
      [
        [0, 0], // 0 + 0i = 0
        [Math.cos(Math.PI / 4), -Math.sin(Math.PI / 4)], // cos(π/4) - i*sin(π/4)
      ],
    ],
    label: "T†",
    color: PHASE_GATE_COLOR,
    bg: PHASE_GATE_BG,
    desc: "Phase(-π/4)",
    qubits: 1,
  },
  CNOT: {
    label: "CX",
    color: LOGICAL_GATE_COLOR,
    bg: LOGICAL_GATE_BG,
    desc: "CNOT",
    qubits: 2,
  },
  CZ: {
    label: "CZ",
    color: PHASE_GATE_COLOR,
    bg: PHASE_GATE_BG,
    desc: "CZ",
    qubits: 2,
  },
  SWAP: {
    label: "SW",
    color: LOGICAL_GATE_COLOR,
    bg: LOGICAL_GATE_BG,
    desc: "SWAP",
    qubits: 2,
  },
};
