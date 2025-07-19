import { useEffect, useRef } from 'react';
import p5 from 'p5';

interface P5BackgroundProps {
  className?: string;
}

const P5Background: React.FC<P5BackgroundProps> = ({ className = "" }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const sketch = (p: p5) => {
      const spacing = 45;
      const maxDist = 120;

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noStroke();
      };

      p.draw = () => {
        // Clean white background that matches the site theme
        p.background(255, 255, 255);

        for (let x = spacing / 2; x < p.width; x += spacing) {
          for (let y = spacing / 2; y < p.height; y += spacing) {
            const d = p.dist(p.mouseX, p.mouseY, x, y);
            const r = p.map(d, 0, maxDist, 30, 6, true);
            const alpha = p.map(d, 0, maxDist, 200, 40, true);
            
            // Use the site's brand yellow color (#fbc700) with varying opacity
            p.colorMode(p.RGB, 255, 255, 255, 255);
            p.fill(251, 199, 0, alpha); // #fbc700 converted to RGB
            p.ellipse(x, y, r);
            
            // Add a subtle inner glow for circles near the mouse using the same yellow
            if (d < maxDist / 2) {
              const innerAlpha = p.map(d, 0, maxDist / 2, 100, 0, true);
              p.fill(251, 199, 0, innerAlpha); // Same yellow with reduced opacity
              p.ellipse(x, y, r * 0.6);
            }
          }
        }
        
        // Ensure color mode is reset for other components
        p.colorMode(p.RGB, 255, 255, 255, 255);
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    // Create the p5 instance
    p5InstanceRef.current = new p5(sketch, containerRef.current);

    // Cleanup function
    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
        p5InstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
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
