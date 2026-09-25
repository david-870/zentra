"use client";

import { useEffect, useRef } from "react";

export function CursorLight() {
  const light = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = light.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let currentX = window.innerWidth / 2;
    let currentY = window.innerHeight * 0.25;
    let targetX = currentX;
    let targetY = currentY;
    let shown = false;
    let frame = 0;

    const aim = (x: number, y: number) => {
      targetX = x;
      targetY = y;
      if (!shown) {
        shown = true;
        node.style.opacity = "1";
      }
    };

    const onPointer = (event: PointerEvent) => {
      aim(event.clientX, event.clientY);
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      node.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={light}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-30 size-[22rem] rounded-full opacity-0 bg-[radial-gradient(circle,rgba(252,253,255,0.16)_0%,rgba(0,117,255,0.28)_18%,transparent_62%)] sm:size-[32rem]"
    />
  );
}
