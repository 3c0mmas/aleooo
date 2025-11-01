import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function GlowingCursor() {
  const canvasRef = useRef(null);
  const trailRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // защита от null
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // защита от ошибки getContext

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    function resize() {
      if (!canvas) return;
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);

    const MAX_POINTS = 20;
    const DECAY = 0.86;
    const mainColor = "#EEFFA8";
    const glowColor = "#C4FFC2";

    function drawPixelArrow(x, y, size, t) {
      const pixelSize = Math.max(2, size / 5);
      const baseAlpha = 0.2 + (1 - t) * 0.5;
      ctx.fillStyle = mainColor;
      ctx.globalAlpha = baseAlpha;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 20 * (1 - t);

      const shape = [
        [0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0],
        [1, 0, 0, 0, 1],
      ];

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((-30 * Math.PI) / 180);

      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col] === 1) {
            const px = (col - shape[row].length / 2) * pixelSize;
            const py = (row - shape.length / 2) * pixelSize;
            ctx.fillRect(px, py, pixelSize, pixelSize);
          }
        }
      }

      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function drawGlowTrail(points) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < points.length - 1; i++) {
        const p = points[i];
        const next = points[i + 1];
        const alpha = 0.12 * (1 - i / points.length);
        ctx.strokeStyle = glowColor;
        ctx.globalAlpha = alpha;
        ctx.lineWidth = 8 * (1 - i / points.length);
        ctx.shadowBlur = 25 * (1 - i / points.length);
        ctx.shadowColor = glowColor;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
      }
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      ctx.save();

      if (trailRef.current.length > 1) drawGlowTrail(trailRef.current);

      for (let i = 0; i < trailRef.current.length; i++) {
        const p = trailRef.current[i];
        const t = i / MAX_POINTS;
        const size = 8 + (1 - t) * 10;
        drawPixelArrow(p.x, p.y, size, t);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(draw);
    }

    draw();

    function pushPoint(x, y) {
      trailRef.current.unshift({ x, y, a: 1 });
      if (trailRef.current.length > MAX_POINTS) trailRef.current.pop();
    }

    function onMove(e) {
      const x = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
      const y = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;
      pushPoint(x, y);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: true });

    const decayInterval = setInterval(() => {
      for (let i = 0; i < trailRef.current.length; i++) {
        const p = trailRef.current[i];
        const next = trailRef.current[i - 1];
        if (next) {
          p.x += (next.x - p.x) * 0.14;
          p.y += (next.y - p.y) * 0.14;
        }
        p.a *= DECAY;
      }
      trailRef.current = trailRef.current.filter((p) => p.a > 0.03);
    }, 30);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      clearInterval(decayInterval);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-40"
    />
  );
}

export default function AleoLanding() {
  const [showMore, setShowMore] = useState(false);

  const events = [
    {
      time: "6:00 PM - 9:00 PM GMT+9, November 1 2025",
      location: "Tokyo, Japan",
      title: "Aleo: Tokyo Compliant Private Token Workshop",
      link: "https://luma.com/aleotokyo2025workshop",
    },
    {
      time: "1:00 PM - 4:00 PM EDT, November 1 2025",
      location: "Toronto, Ontario",
      title: "Aleo: Toronto Compliant Private Token Workshop",
      link: "https://luma.com/aleotorontooctober2025workshop",
    },
    {
      time: "2:30 PM OCT 27–29 2025 PDT",
      location: "Las Vegas, Nevada",
      title: "Aleo's Privacy Lounge @Money20/20",
      link: "https://luma.com/4s1lxlc9",
    },
  ];

  const visibleEvents = showMore ? events : events.slice(0, 3);

  return (
    <motion.div className="relative min-h-screen font-sans text-gray-100 bg-black overflow-x-hidden">
      <GlowingCursor />

      <header className="z-30 relative">
        <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-[#121216] to-[#1b1b20] border border-white/6 flex items-center justify-center shadow-sm">
              <span className="text-xs font-semibold tracking-wider">A</span>
            </div>
            <div className="text-sm text-gray-300">
              Aleo — Private by design
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <a href="#about" className="hover:text-white">
              About
            </a>
            <a href="#events" className="hover:text-white">
              Events
            </a>
            <a href="#community" className="hover:text-white">
              Community
            </a>
          </div>
        </nav>
      </header>

      <main className="z-20 relative">
        <section id="about" className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-3xl font-semibold text-white mb-4">About Aleo</h2>
          <p className="text-gray-300 max-w-3xl">
            Aleo enables developers to build private applications with
            zero-knowledge proofs executed off-chain and verified on-chain. Its
            mission is to make privacy-preserving computing accessible to
            everyone, empowering users to control their own data.
          </p>
        </section>

        <section id="events" className="max-w-6xl mx-auto px-6 py-20">
          <h3 className="text-3xl font-semibold text-white mb-8">
            Aleo Global Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {visibleEvents.map((event, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => window.open(event.link, "_blank")}
                  className="group cursor-pointer bg-white/5 border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-[#EEFFA8]/10 hover:scale-[1.03] hover:shadow-[0_0_25px_#EEFFA8aa]"
                >
                  <div className="text-sm text-gray-400">{event.time}</div>
                  <div className="text-xs text-gray-500">{event.location}</div>
                  <h4 className="mt-3 text-lg font-semibold text-white group-hover:text-[#EEFFA8] transition-colors">
                    {event.title}
                  </h4>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => setShowMore(!showMore)}
              className="px-6 py-3 bg-[#EEFFA8]/10 border border-[#EEFFA8]/30 rounded-xl text-[#EEFFA8] hover:bg-[#EEFFA8]/20 transition"
            >
              {showMore ? "Show Less Events" : "Show More Events"}
            </button>
          </div>
        </section>

        <footer className="max-w-6xl mx-auto px-6 py-12 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Aleo — Community & Governance
        </footer>
      </main>
    </motion.div>
  );
}
