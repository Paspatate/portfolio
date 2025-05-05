export function load_shader_code(gl, shader_type, shader_source) {
    const shader = gl.createShader(shader_type);
    gl.shaderSource(shader, shader_source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export function create_shader_program(gl, shading_modules) {
    const shader_program = gl.createProgram();

    for (const entry of shading_modules) {
        const shader = load_shader_code(gl, entry[0], entry[1]);
        gl.attachShader(shader_program, shader);
    }
    gl.linkProgram(shader_program);

    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(shader_program));
        return null;
    }
    return shader_program;
}