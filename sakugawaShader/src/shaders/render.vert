#version 300 es
precision mediump float;

in vec2 a_vertex;

void main() {
    gl_Position = vec4(a_vertex, 0.0, 1.0);
}
