/*
 * Este script crea un fondo animado de líneas fluidas y reactivas.
 * Las partículas se mueven con más velocidad y responden de forma más notable
 * al cursor, creando una experiencia visual envolvente y dinámica.
 */
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('webgl-bg');
    if (!canvas) {
        console.error("No se encontró el elemento <canvas> con el ID 'webgl-bg'.");
        return;
    }

    const ctx = canvas.getContext('2d');
    let W, H, particles, mouse;
    const maxParticles = 120;
    
    // Objeto para rastrear la posición del mouse
    mouse = {
        x: W / 2,
        y: H / 2,
        radius: (W + H) / 6 // Radio de interacción ampliado
    };

    function resizeCanvas() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        mouse.radius = (W + H) / 6;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Actualiza la posición del mouse
    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.vx = (Math.random() - 0.5) * 0.3; // Velocidad incrementada
            this.vy = (Math.random() - 0.5) * 0.3; // Velocidad incrementada
            this.radius = Math.random() * 1.5 + 0.5;
            this.history = []; // Para el efecto de estela
        }

        draw() {
            // Dibuja la estela
            ctx.beginPath();
            ctx.moveTo(this.history[0]?.x || this.x, this.history[0]?.y || this.y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.strokeStyle = `rgba(110, 168, 216, 0.2)`; // Estela tenue
            ctx.lineWidth = 1;
            ctx.stroke();

            // Dibuja la partícula
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fill();
        }

        update() {
            // Guarda el historial de posición
            this.history.push({x: this.x, y: this.y});
            if (this.history.length > 5) { // Longitud de la estela
                this.history.shift();
            }

            this.x += this.vx;
            this.y += this.vy;

            // Mantiene las partículas dentro del lienzo
            if (this.x < 0 || this.x > W) this.vx *= -1;
            if (this.y < 0 || this.y > H) this.vy *= -1;
        }
    }

    function createParticles() {
        particles = [];
        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        
        ctx.save();
        ctx.filter = 'blur(10px)';
        ctx.fillStyle = 'rgba(26, 115, 232, 0.05)';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.update();
            p.draw();

            // Dibuja líneas entre partículas cercanas
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(110, 168, 216, ${1 - dist / 150})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            // Dibuja líneas desde el mouse a las partículas cercanas
            const dx_mouse = p.x - mouse.x;
            const dy_mouse = p.y - mouse.y;
            const dist_mouse = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
            
            if (dist_mouse < mouse.radius) {
                ctx.beginPath();
                ctx.moveTo(mouse.x, mouse.y);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = `rgba(110, 168, 216, ${1 - dist_mouse / mouse.radius})`;
                ctx.lineWidth = 2; // Líneas más gruesas para destacar
                ctx.stroke();
            }
        }
        requestAnimationFrame(animate);
    }
    
    createParticles();
    animate();
});