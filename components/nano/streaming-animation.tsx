"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { formatUsdc } from "@/lib/utils";

interface StreamingAnimationProps {
  amount: number;
  recipientName: string;
  destinationChain: string;
  isActive: boolean;
  isComplete: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

const PARTICLE_COUNT = 18;
const ANIMATION_DURATION_MS = 4000;

export function StreamingAnimation({
  amount,
  recipientName,
  destinationChain,
  isActive,
  isComplete,
}: StreamingAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [displayAmount, setDisplayAmount] = useState(amount);
  const [progress, setProgress] = useState(0);

  // Drain the displayed balance to zero over ANIMATION_DURATION_MS
  useEffect(() => {
    if (!isActive) return;
    startTimeRef.current = performance.now();
    let rafId: number;

    const drain = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(elapsed / ANIMATION_DURATION_MS, 1);
      setProgress(pct);
      setDisplayAmount(amount * (1 - pct));
      if (pct < 1) rafId = requestAnimationFrame(drain);
    };

    rafId = requestAnimationFrame(drain);
    return () => cancelAnimationFrame(rafId);
  }, [isActive, amount]);

  // Particle canvas
  useEffect(() => {
    if (!isActive || isComplete) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const spawnParticle = (id: number): Particle => ({
      id,
      x: cx + (Math.random() - 0.5) * 20,
      y: cy + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 3,
      vy: -(Math.random() * 2 + 1),
      life: 1,
      maxLife: Math.random() * 60 + 40,
    });

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, (_, i) =>
      spawnParticle(i)
    );

    let running = true;

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);

      particlesRef.current = particlesRef.current.map((p) => {
        const nextLife = p.life - 1 / p.maxLife;
        const alpha = Math.max(0, nextLife);

        // Emerald particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.9})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7 * alpha, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${alpha * 0.2})`;
        ctx.fill();

        if (nextLife <= 0) {
          return spawnParticle(p.id);
        }
        return { ...p, x: p.x + p.vx, y: p.y + p.vy, life: nextLife };
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, [isActive, isComplete]);

  if (!isActive && !isComplete) return null;

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 rounded-xl p-6 glass-card" style={{ borderColor: "rgba(16,185,129,0.25)", boxShadow: "0 0 40px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,0.06)" }}>
      {/* Particle canvas */}
      {isActive && !isComplete && (
        <canvas
          ref={canvasRef}
          width={200}
          height={120}
          className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
        />
      )}

      {/* Completion state */}
      {isComplete ? (
        <div className="flex flex-col items-center gap-3 z-10">
          <CheckCircle2 className="h-12 w-12 text-primary animate-pulse" />
          <p className="text-lg font-bold text-primary">Payment Sent!</p>
          <p className="text-sm text-text-muted">
            {formatUsdc(amount, 2)} USDC → {recipientName}
          </p>
          <p className="text-xs text-text-muted font-mono">{destinationChain}</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 z-10">
          {/* Animated icon */}
          <div className="relative flex h-14 w-14 items-center justify-center">
            <div className="absolute h-14 w-14 rounded-full border-2 border-primary/30 animate-ping" />
            <div className="absolute h-10 w-10 rounded-full border border-primary/50 animate-pulse" />
            <Zap className="h-6 w-6 text-primary" />
          </div>

          {/* Draining amount */}
          <div className="text-center">
            <p className="text-xs text-text-muted mb-1">Streaming to {recipientName}</p>
            <p className="font-mono text-2xl font-bold text-primary tabular-nums">
              {formatUsdc(displayAmount, 4)} USDC
            </p>
            <p className="text-xs text-text-muted mt-0.5 font-mono">{destinationChain}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress * 100}%`,
                background: "linear-gradient(90deg, #10b981, #34d399)",
                boxShadow: "0 0 8px rgba(16,185,129,0.6)",
              }}
            />
          </div>

          <p className="text-xs text-text-muted">
            Nanopayment in progress via Circle Gateway...
          </p>
        </div>
      )}
    </div>
  );
}
