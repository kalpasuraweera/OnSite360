import { useEffect, useRef, useCallback } from 'react';

interface P5BackgroundProps {
  className?: string;
}

const P5Background: React.FC<P5BackgroundProps> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  // Helper functions to replicate p5.js functionality
  const map = (value: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds = false) => {
    const newval = (value - start1) / (stop1 - start1) * (stop2 - start2) + start2;
    if (!withinBounds) return newval;
    if (start2 < stop2) {
      return Math.max(Math.min(newval, stop2), start2);
    } else {
      return Math.max(Math.min(newval, start2), stop2);
    }
  };

  const dist = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const spacing = 45;
    const maxDist = 120;

    // Clear canvas with white background
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid of squares
    for (let x = spacing / 2; x < canvas.width; x += spacing) {
      for (let y = spacing / 2; y < canvas.height; y += spacing) {
        const d = dist(mousePos.current.x, mousePos.current.y, x, y);
        const size = map(d, 0, maxDist, 30, 6, true);
        const alpha = map(d, 0, maxDist, 200, 40, true);
        
        // Use the site's brand yellow color (#fbc700) with varying opacity
        ctx.fillStyle = `rgba(251, 199, 0, ${alpha / 255})`;
        ctx.fillRect(x - size/2, y - size/2, size, size);
        
        // Add a subtle inner glow for squares near the mouse using the same yellow
        if (d < maxDist / 2) {
          const innerAlpha = map(d, 0, maxDist / 2, 100, 0, true);
          const innerSize = size * 0.6;
          ctx.fillStyle = `rgba(251, 199, 0, ${innerAlpha / 255})`;
          ctx.fillRect(x - innerSize/2, y - innerSize/2, innerSize, innerSize);
        }
      }
    }

    animationRef.current = requestAnimationFrame(draw);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    mousePos.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set initial canvas size
    handleResize();

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Start animation loop
    draw();

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw, handleMouseMove, handleResize]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
};

export default P5Background;
