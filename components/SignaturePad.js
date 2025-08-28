import { useRef, useEffect } from "react";

export default function SignaturePad({ value, onChange }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2; // default pen thickness
    ctx.strokeStyle = "#000"; // black ink
  }, []);

  function getPosition(e, rect) {
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }

  function draw(e) {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const { x, y } = getPosition(e, rect);

    if (e.type === "mousedown" || e.type === "touchstart") {
      canvas.isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(x, y);

      if (e.type === "touchstart") {
        document.body.style.overflow = "hidden"; // stop scroll while drawing
      }
    } else if (
      (e.type === "mousemove" || e.type === "touchmove") &&
      canvas.isDrawing
    ) {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (
      e.type === "mouseup" ||
      e.type === "mouseleave" ||
      e.type === "touchend"
    ) {
      canvas.isDrawing = false;
      onChange && onChange(canvas.toDataURL());

      if (e.type === "touchend") {
        document.body.style.overflow = "auto"; // allow scroll again
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
