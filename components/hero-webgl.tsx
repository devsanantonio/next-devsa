"use client"

import { useEffect, useRef } from "react"

export default function HeroWebGL() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const mouseInsideRef = useRef(false)
  const specialTextPosRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)
  let gl: WebGLRenderingContext | null = null
  let program: WebGLProgram | null = null
  let positionBuffer: WebGLBuffer | null = null
  let texCoordBuffer: WebGLBuffer | null = null
  let texture: WebGLTexture | null = null
  let positionLocation: number | null = null
  let texCoordLocation: number | null = null
  let textureLocation: WebGLUniformLocation | null = null
  let mouseLocation: WebGLUniformLocation | null = null
  let resolutionLocation: WebGLUniformLocation | null = null
  let specialTextPosLocation: WebGLUniformLocation | null = null
  let magnifyRadiusPixelsLocation: WebGLUniformLocation | null = null
  let timeLocation: WebGLUniformLocation | null = null

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.log("[v0] Canvas ref not available")
      return
    }

    console.log("[v0] Initializing WebGL...")
    gl = canvas.getContext("webgl")
    if (!gl) {
      console.error("[v0] WebGL not supported")
      return
    }
    console.log("[v0] WebGL context created successfully")

    // Vertex shader source
    const vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        v_texCoord = a_texCoord;
      }
    `

    // Full distortion effects shader
    const fragmentShaderSource = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform vec2 u_mouse;
      uniform vec2 u_resolution;
      uniform vec2 u_specialTextPos;
      uniform float u_magnifyRadiusPixels;
      uniform float u_time;
      varying vec2 v_texCoord;

      void main() {
        // Flip the texture vertically so text appears right-side up
        vec2 uv = vec2(v_texCoord.x, 1.0 - v_texCoord.y);
        vec4 color = texture2D(u_texture, uv);

        // Calculate special text area
        vec2 specialTextUV = u_specialTextPos;
        float aspectRatio = u_resolution.x / u_resolution.y;
        vec2 specialDiff = uv - specialTextUV;
        specialDiff.x *= aspectRatio;
        float specialDist = length(specialDiff);

        // Define a tight radius for the special text line (e.g., 0.03 texture units)
        float specialTextRadius = 0.03;

        // Only apply effects if pixel is over the special text
        if (specialDist < specialTextRadius) {
          // Mouse-based distortion and color effect
          vec2 mouseUV = u_mouse / u_resolution;
          mouseUV.y = 1.0 - mouseUV.y;
          vec2 diff = uv - mouseUV;
          diff.x *= aspectRatio;
          float dist = length(diff);

          float magnifyRadius = u_magnifyRadiusPixels / u_resolution.y;

          if (dist < magnifyRadius) {
            float magnifyStrength = 0.3;
            float magnifyFactor = 1.0 + magnifyStrength * (1.0 - dist / magnifyRadius);
            vec2 magnifiedUV = mouseUV + (uv - mouseUV) / magnifyFactor;
            magnifiedUV = clamp(magnifiedUV, 0.0, 1.0);
            color = texture2D(u_texture, magnifiedUV);
          }

          float colorIntensity = 1.0 - (specialDist / specialTextRadius);
          colorIntensity = smoothstep(0.0, 1.0, colorIntensity);

          void main() {
            // Flip the texture vertically so text appears right-side up
            vec2 uv = vec2(v_texCoord.x, 1.0 - v_texCoord.y);
            vec4 color = texture2D(u_texture, uv);

            // Calculate special text area
            vec2 specialTextUV = u_specialTextPos;
            float aspectRatio = u_resolution.x / u_resolution.y;
            vec2 specialDiff = uv - specialTextUV;
            specialDiff.x *= aspectRatio;
            float specialDist = length(specialDiff);

            // Define a tight radius for the special text line (e.g., 0.03 texture units)
            float specialTextRadius = 0.03;

            // Mouse-based wow effect only when hovering near the special text
            vec2 mouseUV = u_mouse / u_resolution;
            mouseUV.y = 1.0 - mouseUV.y;
            vec2 mouseDiff = specialTextUV - mouseUV;
            mouseDiff.x *= aspectRatio;
            float mouseDist = length(mouseDiff);
            float hoverRadius = 0.08; // How close mouse must be to trigger wow effect

            if (specialDist < specialTextRadius && mouseDist < hoverRadius) {
              // Strong distortion and color effect
              vec2 diff = uv - mouseUV;
              diff.x *= aspectRatio;
              float dist = length(diff);

              float magnifyRadius = u_magnifyRadiusPixels / u_resolution.y;
              if (dist < magnifyRadius) {
                float magnifyStrength = 0.5;
                float magnifyFactor = 1.0 + magnifyStrength * (1.0 - dist / magnifyRadius);
                vec2 magnifiedUV = mouseUV + (uv - mouseUV) / magnifyFactor;
                magnifiedUV = clamp(magnifiedUV, 0.0, 1.0);
                color = texture2D(u_texture, magnifiedUV);
              }

              float colorIntensity = 1.0 - (specialDist / specialTextRadius);
              colorIntensity = smoothstep(0.0, 1.0, colorIntensity);

              // Iridescent color effect
              vec2 direction = normalize(diff);
              float angle = atan(direction.y, direction.x);
              float timeOffset = u_time * 0.002;
              float hue = (angle + 3.14159) / (2.0 * 3.14159) + timeOffset;
              hue = fract(hue);

              vec3 iridescent;
              if (hue < 0.166) {
                iridescent = mix(vec3(1.0, 0.0, 1.0), vec3(0.0, 0.0, 1.0), hue * 6.0);
              } else if (hue < 0.333) {
                iridescent = mix(vec3(0.0, 0.0, 1.0), vec3(0.0, 1.0, 1.0), (hue - 0.166) * 6.0);
              } else if (hue < 0.5) {
                iridescent = mix(vec3(0.0, 1.0, 1.0), vec3(0.0, 1.0, 0.0), (hue - 0.333) * 6.0);
              } else if (hue < 0.666) {
                iridescent = mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (hue - 0.5) * 6.0);
              } else if (hue < 0.833) {
                iridescent = mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.5, 0.0), (hue - 0.666) * 6.0);
              } else {
                iridescent = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 0.0, 1.0), (hue - 0.833) * 6.0);
              }

              color.rgb = mix(color.rgb, iridescent, colorIntensity * 1.0);
            }

            gl_FragColor = color;
          }
        }
    `;

    // Create shader function
    function createShader(type: number, source: string) {
      if (!gl) return null
      const shader = gl.createShader(type)
      if (!shader) return null

      gl.shaderSource(shader, source)
      gl.compileShader(shader)

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("[v0] Shader compile error:", gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }

      return shader
    }

    // Create program function
    function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      if (!gl) return null
      const program = gl.createProgram()
      if (!program) return null

      gl.attachShader(program, vertexShader)
      gl.attachShader(program, fragmentShader)
      gl.linkProgram(program)

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("[v0] Program link error:", gl.getProgramInfoLog(program))
        gl.deleteProgram(program)
        return null
      }

      return program
    }

    // Create text texture
    function createTextTexture() {
      const textCanvas = document.createElement("canvas")
      const ctx = textCanvas.getContext("2d")
      if (!ctx) return null

      const viewportWidth = window.innerWidth
      const isDesktop = viewportWidth >= 768

      let targetWidth
      if (isDesktop) {
        targetWidth = Math.min(viewportWidth * 0.8, 1000)
      } else {
        targetWidth = viewportWidth - 40
      }

      ctx.font = "12px monospace"
      const actualCharWidth = ctx.measureText("tech ").width / 5 // 5 characters in "tech "

      const internalPadding = isDesktop ? 80 : 15
      const availableTextWidth = targetWidth - internalPadding * 2

      const baseCharsPerLine = Math.floor(availableTextWidth / actualCharWidth)
      const evenCharsPerLine = baseCharsPerLine % 2 === 0 ? baseCharsPerLine : baseCharsPerLine - 1
      const minCharsNeeded = 20
      const charsPerLine = Math.max(evenCharsPerLine, minCharsNeeded)

      const actualTextWidth = charsPerLine * actualCharWidth
      textCanvas.width = actualTextWidth + internalPadding * 2
      textCanvas.height = window.innerHeight

      ctx.fillStyle = "#000000"
      ctx.fillRect(0, 0, textCanvas.width, textCanvas.height)

      ctx.fillStyle = "#374151"
      ctx.font = "12px monospace"

      const text = "tech"
      const specialText = "WHERE IS THE TECH COMMUNITY IN SAN ANTONIO?"
      const lineHeight = 16

      const horizontalOffset = internalPadding
      const availableHeight = textCanvas.height
      const linesCount = Math.floor(availableHeight / lineHeight)
      const reservedBottomLines = 4

      const techsPerLine = Math.floor(charsPerLine / text.length)
      const standardLineLength = techsPerLine * text.length

      let specialInserted = false
      const specialTextNormalizedPos = { x: 0, y: 0 }

      for (let lineIndex = 0; lineIndex < linesCount; lineIndex++) {
        const y = lineIndex * lineHeight
        let line = ""

        const isInSpecialTextZone = lineIndex > linesCount * 0.7 && lineIndex < linesCount - reservedBottomLines
        const isReservedBottomLine = lineIndex >= linesCount - reservedBottomLines

        if (!specialInserted && isInSpecialTextZone) {
          const specialTextLength = specialText.length + 1
          const techsToReplace = Math.ceil(specialTextLength / text.length)
          const techsBeforeSpecial = Math.max(0, techsPerLine - techsToReplace - 2)

          for (let i = 0; i < techsBeforeSpecial; i++) {
            line += text
          }

          line += specialText + " "

          const remainingTechs = Math.max(0, techsPerLine - techsBeforeSpecial - techsToReplace)
          for (let i = 0; i < remainingTechs; i++) {
            line += text
          }

          const specialTextStartPos = techsBeforeSpecial * text.length
          const wherePositionInSpecialText = 0
          const totalCharPosition = specialTextStartPos + wherePositionInSpecialText + specialText.length / 2

          specialTextNormalizedPos.x = (horizontalOffset + totalCharPosition * actualCharWidth) / textCanvas.width
          specialTextNormalizedPos.y = (y + lineHeight) / textCanvas.height
          specialInserted = true
        } else {
          for (let i = 0; i < techsPerLine; i++) {
            line += text
          }
        }

        ctx.fillText(line, horizontalOffset, y + lineHeight)
      }

      if (!specialInserted) {
        const fallbackLineIndex = linesCount - reservedBottomLines - 1
        const y = fallbackLineIndex * lineHeight

        const specialTextLength = specialText.length + 1
        const techsToReplace = Math.ceil(specialTextLength / text.length)
        const techsBeforeSpecial = Math.max(0, techsPerLine - techsToReplace - 2)
        let line = ""

        for (let i = 0; i < techsBeforeSpecial; i++) {
          line += text
        }

        line += specialText + " "

        const remainingTechs = Math.max(0, techsPerLine - techsBeforeSpecial - techsToReplace)
        for (let i = 0; i < remainingTechs; i++) {
          line += text
        }

        const specialTextStartPos = techsBeforeSpecial * text.length
        const totalCharPosition = specialTextStartPos + specialText.length / 2

        specialTextNormalizedPos.x = (horizontalOffset + totalCharPosition * actualCharWidth) / textCanvas.width
        specialTextNormalizedPos.y = (y + lineHeight) / textCanvas.height

        ctx.fillStyle = "#000000"
        ctx.fillRect(0, y, textCanvas.width, lineHeight)
        ctx.fillStyle = "#374151"
        ctx.fillText(line, horizontalOffset, y + lineHeight)
      }

      return { canvas: textCanvas, specialTextPos: specialTextNormalizedPos }
    }

    console.log("[v0] Creating shaders...")
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource)
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource)

    if (!vertexShader || !fragmentShader) {
      console.error("[v0] Failed to create shaders")
      return
    }

    console.log("[v0] Creating program...")
    program = createProgram(vertexShader, fragmentShader)
    if (!program) {
      console.error("[v0] Failed to create program")
      return
    }

    positionLocation = gl.getAttribLocation(program, "a_position")
    texCoordLocation = gl.getAttribLocation(program, "a_texCoord")
    textureLocation = gl.getUniformLocation(program, "u_texture")
    mouseLocation = gl.getUniformLocation(program, "u_mouse")
    resolutionLocation = gl.getUniformLocation(program, "u_resolution")
    specialTextPosLocation = gl.getUniformLocation(program, "u_specialTextPos") // Fixed uniform name to match shader declaration
    magnifyRadiusPixelsLocation = gl.getUniformLocation(program, "u_magnifyRadiusPixels")
    timeLocation = gl.getUniformLocation(program, "u_time")

    positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    // Full screen quad covering [-1, -1] to [1, 1]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

    texCoordBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
    // Texture coordinates covering [0, 0] to [1, 1]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]), gl.STATIC_DRAW)

    texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)

    console.log("[v0] Creating text texture...")
    const textResult = createTextTexture()
    if (textResult) {
      specialTextPosRef.current = textResult.specialTextPos
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textResult.canvas)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      console.log("[v0] Text texture created successfully")
    } else {
      console.error("[v0] Failed to create text texture")
      return
    }

    function resizeCanvas() {
      if (!canvas || !gl) return

      const viewportWidth = window.innerWidth
      const isDesktop = viewportWidth >= 768

      let targetWidth
      if (isDesktop) {
        targetWidth = Math.min(viewportWidth * 0.8, 1000)
      } else {
        targetWidth = viewportWidth - 40
      }

      const tempCanvas = document.createElement("canvas")
      const tempCtx = tempCanvas.getContext("2d")
      if (!tempCtx) return

      tempCtx.font = "12px monospace"
      const actualCharWidth = tempCtx.measureText("tech ").width / 5

      const internalPadding = isDesktop ? 80 : 15
      const availableTextWidth = targetWidth - internalPadding * 2

      const baseCharsPerLine = Math.floor(availableTextWidth / actualCharWidth)
      const evenCharsPerLine = baseCharsPerLine % 2 === 0 ? baseCharsPerLine : baseCharsPerLine - 1
      const minCharsNeeded = 20
      const finalCharsPerLine = Math.max(evenCharsPerLine, minCharsNeeded)

      const actualCanvasWidth = finalCharsPerLine * actualCharWidth + internalPadding * 2

      // Set canvas size to match text canvas size for correct mapping
      const textResult = createTextTexture()
      if (textResult && texture) {
        canvas.width = textResult.canvas.width
        canvas.height = textResult.canvas.height

        canvas.style.width = textResult.canvas.width + "px"
        canvas.style.height = textResult.canvas.height + "px"

        gl.viewport(0, 0, canvas.width, canvas.height)

        specialTextPosRef.current = textResult.specialTextPos
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textResult.canvas)
      }
    }

    function handleMouseMove(event: MouseEvent) {
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = event.clientX - rect.left
      mouseRef.current.y = event.clientY - rect.top
    }

    function handleMouseEnter() {
      mouseInsideRef.current = true
    }

    function handleMouseLeave() {
      mouseInsideRef.current = false
    }

    function handleTouchStart(event: TouchEvent) {
      if (!canvas) return
      event.preventDefault()
      mouseInsideRef.current = true
      const rect = canvas.getBoundingClientRect()
      const touch = event.touches[0]
      mouseRef.current.x = touch.clientX - rect.left
      mouseRef.current.y = touch.clientY - rect.top
    }

    function handleTouchMove(event: TouchEvent) {
      if (!canvas) return
      event.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const touch = event.touches[0]
      mouseRef.current.x = touch.clientX - rect.left
      mouseRef.current.y = touch.clientY - rect.top
    }

    function handleTouchEnd(event: TouchEvent) {
      event.preventDefault()
      mouseInsideRef.current = false
    }

    function render() {
      if (!gl) {
        console.error("[v0] WebGL context is null")
        return
      }
      if (!program) {
        console.error("[v0] WebGL program is null")
        return
      }
      // Ensure the correct program is in use before setting uniforms and drawing
      gl.useProgram(program)
      if (!positionBuffer) {
        console.error("[v0] Position buffer is null")
        return
      }
      if (!texCoordBuffer) {
        console.error("[v0] TexCoord buffer is null")
        return
      }
      if (!texture) {
        console.error("[v0] Texture is null")
        return
      }
      if (positionLocation === null) {
        console.error("[v0] Position location is null")
        return
      }
      if (texCoordLocation === null) {
        console.error("[v0] TexCoord location is null")
        return
      }
      if (!textureLocation) {
        console.error("[v0] Texture uniform location is null")
        return
      }
      if (!mouseLocation) {
        console.error("[v0] Mouse uniform location is null")
        return
      }
      if (!resolutionLocation) {
        console.error("[v0] Resolution uniform location is null")
        return
      }
      if (!specialTextPosLocation) {
        console.error("[v0] Special text position uniform location is null")
        return
      }
      if (!magnifyRadiusPixelsLocation) {
        console.error("[v0] Magnify radius pixels uniform location is null")
        return
      }
      if (!timeLocation) {
        console.error("[v0] Time uniform location is null")
        return
      }
      if (!canvas) {
        console.error("[v0] Canvas is null")
        return
      }

      const viewportWidth = window.innerWidth
      const baseWidth = 768

      const isMobile = viewportWidth < 768
      const magnifyRadiusPixels = 140.0

      gl.uniform1f(magnifyRadiusPixelsLocation, magnifyRadiusPixels)

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)

      gl.uniform1i(textureLocation, 0)
      gl.uniform2f(mouseLocation, mouseRef.current.x, mouseRef.current.y)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
      gl.uniform2f(specialTextPosLocation, specialTextPosRef.current.x, specialTextPosRef.current.y)
      gl.uniform1f(timeLocation, timeRef.current)

      // Setup position attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.enableVertexAttribArray(positionLocation)
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

      // Setup texCoord attribute
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer)
      gl.enableVertexAttribArray(texCoordLocation)
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0)

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

      timeRef.current += 16.67
      requestAnimationFrame(render)
    }

    window.addEventListener("resize", resizeCanvas)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseenter", handleMouseEnter)
    canvas.addEventListener("mouseleave", handleMouseLeave)
    canvas.addEventListener("touchstart", handleTouchStart)
    canvas.addEventListener("touchmove", handleTouchMove)
    canvas.addEventListener("touchend", handleTouchEnd)

    console.log("[v0] Starting initial render...")
    resizeCanvas()
    render()

    return () => {
      console.log("[v0] Cleaning up WebGL resources...")
      if (!canvas) return
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseenter", handleMouseEnter)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  return (
    <div className="w-full h-screen overflow-hidden bg-black flex justify-center px-[0] touch-none">
      <canvas ref={canvasRef} className="border-0" style={{ display: "block" }} />
    </div>
  )
}
