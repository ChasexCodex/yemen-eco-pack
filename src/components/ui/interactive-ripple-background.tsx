"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface Ripple {
  x: number;
  y: number;
  id: number;
  timestamp: number;
}

export const RippleBackground = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rippleIdRef = useRef(0);

  const createRipple = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple: Ripple = {
      x,
      y,
      id: rippleIdRef.current++,
      timestamp: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 2000);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.random() * rect.width;
      const y = Math.random() * rect.height;

      const newRipple: Ripple = {
        x,
        y,
        id: rippleIdRef.current++,
        timestamp: Date.now(),
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
      }, 2000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative min-h-screen w-full cursor-pointer overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50",
        className,
      )}
      onClick={createRipple}
    >
      {ripples.map((ripple) => (
        <div
          key={`${ripple.id}-${ripple.timestamp}`}
          className="pointer-events-none absolute"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="absolute inset-0 rounded-full border-2 border-purple-400/30 animate-ripple" />
          <div
            className="absolute inset-0 rounded-full border-2 border-blue-400/20 animate-ripple"
            style={{ animationDelay: "0.2s" }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 border-pink-400/10 animate-ripple"
            style={{ animationDelay: "0.4s" }}
          />
        </div>
      ))}

      <div className="relative z-10">
        {children || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h2 className="mb-4 text-4xl font-bold text-gray-800">
                Interactive Ripple Background
              </h2>
              <p className="text-gray-600">Click anywhere to create ripples</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes ripple {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 400px;
            height: 400px;
            opacity: 0;
          }
        }

        .animate-ripple {
          animation: ripple 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
