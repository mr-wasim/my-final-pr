import { useRef, useState } from "react";

export default function SignaturePad({ value, onChange }) {
  const ref = useRef(null);
  const [points, setPoints] = useState([]);

  function getPosition(e, rect) {
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
        time: Date.now(),
      };
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      return {
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top,
        time: Date.now(),
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        time: Date.now(),
      };
    }
  }

  function draw(e) {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const pos = getPosition(e, rect);

    if (e.type === "mousedown" || e.type === "touchstart") {
      canvas.isDrawing = true;
      setPoints([pos]);
      ctx.beginPath();

      if (e.type === "touchstart") {
        document.body.style.overflow = "hidden"; // disable scroll while drawing
      }
    } else if (
      (e.type === "mousemove" || e.type === "touchmove") &&
      canvas.isDrawing
    ) {
      setPoints((prev) => {
        const newPoints = [...prev, pos];
        if (newPoints.length > 2) {
          const [p1, p2, p3] = newPoints.slice(-3);

          // Calculate velocity
          const dist = Math.sqrt(
            Math.pow(p3.x - p2.x, 2) + Math.pow(p3.y - p2.y, 2)
          );
          const time = p3.time - p2.time || 1;
          const velocity = dist / time;

          // Dynamic line width based on velocity
          const lineWidth = Math.max(1.5, 4 - velocity * 2);

          ctx.lineWidth = lineWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";

          // Draw quadratic curve for smoothness
          const midX = (p1.x + p3.x) / 2;
          const midY = (p1.y + p3.y) / 2;

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(p2.x, p2.y, midX, midY);
          ctx.stroke();
        }
        return newPoints;
      });
    } else if (
      e.type === "mouseup" ||
      e.type === "mouseleave" ||
      e.type === "touchend"
    ) {
      canvas.isDrawing = false;
      setPoints([]);
      onChange && onChange(canvas.toDataURL());

      if (e.type === "touchend") {
        document.body.style.overflow = "auto"; // enable scroll again
      }
    }

    e.preventDefault();
  }

  function clear() {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    onChange && onChange("");
  }

  return (
    <div>
      <canvas
        ref={ref}
        width={600}
        height={180}
        className="border rounded-xl w-full bg-white touch-none"
        onMouseDown={draw}
        onMouseMove={draw}
        onMouseUp={draw}
        onMouseLeave={draw}
        onTouchStart={draw}
        onTouchMove={draw}
        onTouchEnd={draw}
      />
      <button
        type="button"
        onClick={clear}
        className="mt-2 px-3 py-1 rounded-lg border"
      >
        Clear
      </button>
    </div>
  );
}
