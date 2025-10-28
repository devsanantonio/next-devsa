"use client";

import { useEffect, useRef } from "react";

interface PixelatedCanvasProps {
  src: string;
  width: number;
  height: number;
  cellSize?: number;
  dotScale?: number;
  shape?: "square" | "circle";
  backgroundColor?: string;
  dropoutStrength?: number;
  interactive?: boolean;
  distortionStrength?: number;
  distortionRadius?: number;
  distortionMode?: "repel" | "attract";
  followSpeed?: number;
  jitterStrength?: number;
  jitterSpeed?: number;
  sampleAverage?: boolean;
  className?: string;
}

export function PixelatedCanvas({
  src,
  width,
  height,
  cellSize = 4,
  dotScale = 0.9,
  shape = "square",
  backgroundColor = "#000000",
  dropoutStrength = 0.1,
  interactive = false,
  distortionStrength = 0.1,
  distortionRadius = 200,
  distortionMode = "repel",
  followSpeed = 0.2,
  jitterStrength = 4,
  jitterSpeed = 1,
  sampleAverage = false,
  className = "",
}: PixelatedCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      imageRef.current = img;
      console.log("Image loaded successfully:", src);
      startAnimation();
    };

    img.onerror = (error) => {
      console.error("Failed to load image:", src, error);
      // Create a simple colored rectangle as fallback
      imageRef.current = null;
      startAnimation();
    };

    // Handle different image sources
    if (src.endsWith('.svg') || src.includes('svg')) {
      // For SVG, convert to data URL to avoid CORS issues
      img.src = src;
    } else {
      img.src = src;
    }

    const startAnimation = () => {
      let time = 0;
      let tempCanvas: HTMLCanvasElement | null = null;
      let tempCtx: CanvasRenderingContext2D | null = null;

      const animate = () => {
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = backgroundColor || "transparent";
        ctx.fillRect(0, 0, width, height);

        // If no image loaded, create a simple pattern
        if (!imageRef.current) {
          const cols = Math.floor(width / cellSize);
          const rows = Math.floor(height / cellSize);
          
          for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
              if (Math.random() > dropoutStrength) {
                ctx.fillStyle = "#ef426f";
                const pixelX = x * cellSize;
                const pixelY = y * cellSize;
                const size = cellSize * dotScale;
                const offset = (cellSize - size) / 2;
                ctx.fillRect(pixelX + offset, pixelY + offset, size, size);
              }
            }
          }
          
          time += 0.016;
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        // Create temp canvas once
        if (!tempCanvas) {
          tempCanvas = document.createElement("canvas");
          tempCtx = tempCanvas.getContext("2d");
          if (!tempCtx) return;
          
          tempCanvas.width = imageRef.current.width;
          tempCanvas.height = imageRef.current.height;
          
          // Draw image to temp canvas
          tempCtx.fillStyle = "white";
          tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
          tempCtx.drawImage(imageRef.current, 0, 0);
        }

        // Draw pixelated image
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);

        for (let x = 0; x < cols; x++) {
          for (let y = 0; y < rows; y++) {
            const pixelX = x * cellSize;
            const pixelY = y * cellSize;

            // Sample the original image
            const sampleX = Math.floor((x / cols) * imageRef.current.width);
            const sampleY = Math.floor((y / rows) * imageRef.current.height);

            if (!tempCtx) continue;
            
            const imageData = tempCtx.getImageData(sampleX, sampleY, 1, 1);
            const [r, g, b, a] = imageData.data;

            // Skip transparent or very light pixels
            if (a < 50 || (r > 250 && g > 250 && b > 250)) continue;

            // Apply dropout
            if (Math.random() < dropoutStrength) continue;

            // Calculate distance from mouse for distortion
            let distortX = 0;
            let distortY = 0;
            
            if (interactive) {
              const dx = pixelX - mouseRef.current.x;
              const dy = pixelY - mouseRef.current.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance < distortionRadius) {
                const force = (1 - distance / distortionRadius) * distortionStrength;
                const angle = Math.atan2(dy, dx);
                
                if (distortionMode === "repel") {
                  distortX = Math.cos(angle) * force * 50;
                  distortY = Math.sin(angle) * force * 50;
                } else {
                  distortX = -Math.cos(angle) * force * 50;
                  distortY = -Math.sin(angle) * force * 50;
                }
              }
            }

            // Add jitter
            const jitterX = Math.sin(time * jitterSpeed + x * 0.1) * jitterStrength;
            const jitterY = Math.cos(time * jitterSpeed + y * 0.1) * jitterStrength;

            const finalX = pixelX + distortX + jitterX;
            const finalY = pixelY + distortY + jitterY;

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            
            if (shape === "circle") {
              ctx.beginPath();
              ctx.arc(
                finalX + cellSize / 2,
                finalY + cellSize / 2,
                (cellSize / 2) * dotScale,
                0,
                Math.PI * 2
              );
              ctx.fill();
            } else {
              const size = cellSize * dotScale;
              const offset = (cellSize - size) / 2;
              ctx.fillRect(finalX + offset, finalY + offset, size, size);
            }
          }
        }

        time += 0.016; // ~60fps
        animationRef.current = requestAnimationFrame(animate);
      };

      animate();
    };

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) * (width / rect.width);
      mouseRef.current.y = (e.clientY - rect.top) * (height / rect.height);
    };

    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (interactive && canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [
    src,
    width,
    height,
    cellSize,
    dotScale,
    shape,
    backgroundColor,
    dropoutStrength,
    interactive,
    distortionStrength,
    distortionRadius,
    distortionMode,
    followSpeed,
    jitterStrength,
    jitterSpeed,
    sampleAverage,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{ width: "100%", height: "100%" }}
    />
  );
}