stateDiagram-v2
[*] --> q0c_q0d_q0i_q0n_q0s_qStart

q0c_q0d_q0i_q0n_q0s_qStart --> q1s: [ " ]
q0c_q0d_q0i_q0n_q0s_qStart --> q1n: [ dígito ]
q0c_q0d_q0i_q0n_q0s_qStart --> q2n: [ . ]
q0c_q0d_q0i_q0n_q0s_qStart --> q1i: [ letra ]
q0c_q0d_q0i_q0n_q0s_qStart --> q1i: [ _ ]
q0c_q0d_q0i_q0n_q0s_qStart --> q1d: [ delimitador ]
q0c_q0d_q0i_q0n_q0s_qStart --> q1c: [ // ]
q0c_q0d_q0i_q0n_q0s_qStart --> q2c: [ /// ]

q1s --> q1s: [ char ]
q1s --> q1s: [ escape ]
q1s --> [*]

q1n --> q1n: [ dígito ]
q1n --> q2n: [ . ]
q1n --> q4n: [ exp ]
q1n --> [*]

q2n --> q3n: [ dígito ]
q2n --> q4n: [ exp ]

q3n --> q3n: [ dígito ]
q3n --> [*]

q4n --> q6n: [ dígito ]
q4n --> q5n: [ sinal ]

q5n --> q6n: [ dígito ]
q6n --> q6n: [ dígito ]
q6n --> [*]

q1i --> q1i: [ letra ]
q1i --> q1i: [ dígito ]
q1i --> q1i: [ _ ]
q1i --> [*]

q1d --> q1d: [ delimitador ]
q1d --> [*]

q1c --> q1c: [ no escape ]
q1c --> [*]

q2c --> q2c: [ não repetiu /// ]
q2c --> [*]