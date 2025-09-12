/* Este script se encarga de crear el fondo animado de WebGL */
function getCanvas(el) {
    el = el || document.body;
    var canvas = document.createElement("canvas");
    el.appendChild(canvas);
    return canvas;
}
function resizeCanvas(canvas) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.onresize = function() {
    resizeCanvas(document.getElementById("webgl-bg"));
};

var config = {
    color: "68, 149, 255", // Color del fondo animado (RGB)
    radius: 0.9,
    density: 0.2,
    clearOpacity: 0.1,
    speed: 0.05
};

var webgl = {
    init: function() {
        this.canvas = document.getElementById("webgl-bg");
        if (!this.canvas) return;

        resizeCanvas(this.canvas);
        
        try {
            this.gl = this.canvas.getContext("webgl", {
                alpha: false
            });
        } catch (e) {
            console.error("WebGL no es compatible con este navegador.");
            return;
        }

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.enable(this.gl.BLEND);
        this.gl.disable(this.gl.DEPTH_TEST);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, -1, 1, 1]), this.gl.STATIC_DRAW);
        this.program = this.gl.createProgram();
        this.shader(this.gl.VERTEX_SHADER, "attribute vec2 position;\nvoid main(void) {\n    gl_Position = vec4(position, 0., 1.);\n}");
        this.shader(this.gl.FRAGMENT_SHADER, "precision mediump float;\nuniform vec2 resolution;\nuniform float time;\nuniform vec3 color;\nvoid main(void) {\n    vec2 position = (gl_FragCoord.xy / resolution.xy) - 0.5;\n    float t = time * " + config.speed + ";\n    float v = 0.0;\n    float x = 0.0;\n    for(int i = 0; i < 50; i++) {\n        v += dot(sin(position * " + config.density + " * x + t), cos(position * " + config.density + " * x + t));\n        x += " + config.radius + ";\n    }\n    gl_FragColor = vec4(vec3(v), 1.0) * vec4(color / 255.0, 1.0);\n}");
        this.gl.linkProgram(this.program);
        this.gl.useProgram(this.program);
        this.gl.a = this.gl.getAttribLocation(this.program, "position");
        this.time = this.gl.getUniformLocation(this.program, "time");
        this.resolution = this.gl.getUniformLocation(this.program, "resolution");
        this.color = this.gl.getUniformLocation(this.program, "color");
        this.gl.enableVertexAttribArray(this.gl.a);
        this.gl.vertexAttribPointer(this.gl.a, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.uniform3f(this.color, config.color.split(',')[0], config.color.split(',')[1], config.color.split(',')[2]);
        this.render();
    },
    shader: function(type, source) {
        var shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("SHADER ERROR:", this.gl.getShaderInfoLog(shader));
            return;
        }
        this.gl.attachShader(this.program, shader);
    },
    render: function(time) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.uniform1f(this.time, time / 1000);
        this.gl.uniform2f(this.resolution, this.canvas.width, this.canvas.height);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(this.render.bind(this));
    }
};

window.onload = function() {
    webgl.init();
};