import { create_shader_program } from "./load_shader.js";
import { mat_scale } from "./matrix.js";
import { Point } from "./point.js";

const canvas = document.querySelector("#frame")

if (canvas === null) {
    console.error("Can't find canvas");
}

const gl = canvas.getContext("webgl2")

if (gl === null) {
    console.error("WebGL2 not supported")
}

const vertex_shader = 
`#version 300 es
precision highp float;

in vec2 a_pos;

void main() {
    gl_Position = vec4(a_pos.xy, 0.0, 1.0);
}
`;

const frag_shader =
`#version 300 es 
#define BRIGHT_GREEN vec3(245.0/255.0, 119.0/255.0, 0.0)
#define BRIGHT_PURPLE vec3(200.0/255.0, 0.0, 245.0/255.0)
#define BRIGHT_ORANGE vec3(141.0/255.0, 250.0/255.0, 0.0)
#define BACKGROUND vec3(40.0/255.0, 44.0/255.0, 56.0/255.0)
precision highp float;

out vec4 f_color;

uniform mat4 scaling_ratio;
uniform vec4[3] u_positions;

float smin( float a, float b, float k )
{
    k *= 1.0;
    float r = exp2(-a/k) + exp2(-b/k);
    return -k*log2(r);
}

float sdfCircle(vec2 frag_coord, vec2 center, float radius) {
    return distance(center, frag_coord) - radius;
}

float sdfScene(vec2 frag_coord) {
    vec4 points[] = u_positions;
    for (int i = 0; i < 3; i++) {
        points[i] *= scaling_ratio;
    }
    
    float sdfObject[3];

    for (int i = 0; i < 3; i++) {
        sdfObject[i] = sdfCircle(frag_coord, points[i].xy, 50.0);
    }

    float choosed_sdf = sdfObject[0];
    for (int i = 0; i < 3; i++) {
        choosed_sdf = smin(choosed_sdf, sdfObject[i], 70.0);
    }

    return choosed_sdf;
}

// fonctionne en pixel (100.0 = 100px)
// gl_FragCoord => ~ (0.0, 0.0) en bas a droite et ~(Width, Height) en haut a gauche, décalé de 0.5
void main() {
    vec3 out_color = vec3(0.1);
    vec4 frag_coord = scaling_ratio * gl_FragCoord;

    out_color = sdfScene(frag_coord.xy) < 10.0 ? BRIGHT_ORANGE : BACKGROUND;
    out_color = sdfScene(frag_coord.xy) < 0.0 ? BACKGROUND : out_color;
    f_color = vec4(out_color, 1.0);
}
`

const shader_program = create_shader_program(gl, 
    [
        [gl.VERTEX_SHADER, vertex_shader],
        [gl.FRAGMENT_SHADER, frag_shader]
    ]
)
const square = [
    -1.0, 1.0,
    1.0, 1.0,
    1.0, -1.0,

    -1.0, 1.0,
    1.0, -1.0,
    -1.0, -1.0,
]

const square_float = new Float32Array(square)

const position_loc = gl.getAttribLocation(shader_program, "a_pos")
const scaling_ratio_loc = gl.getUniformLocation(shader_program, "scaling_ratio")
const upositions_loc = gl.getUniformLocation(shader_program, "u_positions")

const squareBuf = gl.createBuffer()
gl.bindBuffer(gl.ARRAY_BUFFER, squareBuf)
gl.bufferData(gl.ARRAY_BUFFER, square_float, gl.STATIC_DRAW)

gl.enableVertexAttribArray(position_loc)
gl.vertexAttribPointer(position_loc, 2, gl.FLOAT, false, 0, 0);

let points = [new Point(), new Point(), new Point()]
let start_time;

function start() {
    gl.clearColor(0.1, 0.1, 0.1, 1.0)

    requestAnimationFrame(frame)
}

function update(delta_time) {

    for (let i = 0; i < points.length; i++) {
        points[i].update(delta_time)
    }
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT)

    gl.useProgram(shader_program)
    gl.bindBuffer(gl.ARRAY_BUFFER, squareBuf)

    let scaling_mat = new Float32Array(mat_scale(canvas.clientWidth/canvas.width, canvas.clientHeight/canvas.height, 1))

    gl.uniformMatrix4fv(scaling_ratio_loc, false, scaling_mat)

    let positions = [];

    for (let i = 0; i < points.length; i++) {
        positions.push(...points[i].flattened_pos());
    }

    gl.uniform4fv(upositions_loc, new Float32Array(positions))
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}

function frame(timestamp) {
    if (start_time === undefined) {
        start_time = timestamp;
    }

    let delta_time = timestamp - start_time;
    update(delta_time)
    draw()
    start_time = timestamp;
    requestAnimationFrame(frame)
}

start()