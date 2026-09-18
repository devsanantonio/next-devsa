// Minimal dependency-free PNG decode/encode, used by the tee asset pipeline.
// Handles 8-bit non-interlaced PNGs in every channel layout we actually meet: greyscale,
// greyscale+alpha, RGB and RGBA. Logos and cutouts arrive as RGBA, photographs as RGB,
// and the odd converted portrait as greyscale. Everything is widened to RGBA on the way
// out. Anything else throws rather than being guessed at.

import zlib from "node:zlib"

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = -1
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}

/** Decode an 8-bit RGB or RGBA PNG into { width, height, data } where data is RGBA bytes. */
export function decodePng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG")
  let off = 8
  let width = 0
  let height = 0
  let depth = 0
  let colorType = 0
  const idat = []

  while (off < buf.length) {
    const len = buf.readUInt32BE(off)
    const type = buf.toString("ascii", off + 4, off + 8)
    if (type === "IHDR") {
      width = buf.readUInt32BE(off + 8)
      height = buf.readUInt32BE(off + 12)
      depth = buf[off + 16]
      colorType = buf[off + 17]
      if (buf[off + 20] !== 0) throw new Error("interlaced PNG unsupported")
    } else if (type === "IDAT") {
      idat.push(buf.subarray(off + 8, off + 8 + len))
    } else if (type === "IEND") {
      break
    }
    off += 12 + len
  }
  // 0 grey, 2 RGB, 4 grey+alpha, 6 RGBA.
  const CHANNELS = { 0: 1, 2: 3, 4: 2, 6: 4 }
  const bpp = CHANNELS[colorType]
  if (depth !== 8 || !bpp) {
    throw new Error(`expected an 8-bit greyscale/RGB/RGBA PNG, got depth=${depth} colorType=${colorType}`)
  }

  const raw = zlib.inflateSync(Buffer.concat(idat))
  const stride = width * bpp
  const data = Buffer.alloc(height * stride)
  let p = 0

  for (let y = 0; y < height; y++) {
    const filter = raw[p++]
    const row = data.subarray(y * stride, (y + 1) * stride)
    const prev = y > 0 ? data.subarray((y - 1) * stride, y * stride) : null
    raw.copy(row, 0, p, p + stride)
    p += stride
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0
      const b = prev ? prev[i] : 0
      const c = prev && i >= bpp ? prev[i - bpp] : 0
      let v = row[i]
      if (filter === 1) v += a
      else if (filter === 2) v += b
      else if (filter === 3) v += (a + b) >> 1
      else if (filter === 4) {
        const pp = a + b - c
        const pa = Math.abs(pp - a)
        const pb = Math.abs(pp - b)
        const pc = Math.abs(pp - c)
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      row[i] = v & 0xff
    }
  }

  if (bpp === 4) return { width, height, data }

  const rgba = Buffer.alloc(width * height * 4)
  for (let px = 0; px < width * height; px++) {
    const i = px * bpp
    const o = px * 4
    const grey = bpp <= 2
    rgba[o] = data[i]
    rgba[o + 1] = grey ? data[i] : data[i + 1]
    rgba[o + 2] = grey ? data[i] : data[i + 2]
    rgba[o + 3] = bpp === 2 ? data[i + 1] : 255
  }
  return { width, height, data: rgba }
}

function chunk(type, body) {
  const out = Buffer.alloc(body.length + 12)
  out.writeUInt32BE(body.length, 0)
  out.write(type, 4, "ascii")
  body.copy(out, 8)
  out.writeUInt32BE(crc32(out.subarray(4, 8 + body.length)), 8 + body.length)
  return out
}

/** Encode RGBA bytes back to a PNG buffer. */
export function encodePng({ width, height, data }) {
  const stride = width * 4
  const raw = Buffer.alloc(height * (stride + 1))
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // filter: none — these images compress fine flat
    data.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

/** Box-filter downscale with alpha-weighted colour, so cutout edges don't smear toward black. */
export function resample(img, outW, outH) {
  const { width, height, data } = img
  const out = Buffer.alloc(outW * outH * 4)
  const sx = width / outW
  const sy = height / outH
  for (let y = 0; y < outH; y++) {
    const y0 = Math.floor(y * sy)
    const y1 = Math.max(y0 + 1, Math.floor((y + 1) * sy))
    for (let x = 0; x < outW; x++) {
      const x0 = Math.floor(x * sx)
      const x1 = Math.max(x0 + 1, Math.floor((x + 1) * sx))
      let r = 0
      let g = 0
      let b = 0
      let aSum = 0
      let n = 0
      for (let yy = y0; yy < y1 && yy < height; yy++) {
        for (let xx = x0; xx < x1 && xx < width; xx++) {
          const i = (yy * width + xx) * 4
          const a = data[i + 3] / 255
          r += data[i] * a
          g += data[i + 1] * a
          b += data[i + 2] * a
          aSum += a
          n++
        }
      }
      const o = (y * outW + x) * 4
      if (aSum > 0) {
        out[o] = Math.round(r / aSum)
        out[o + 1] = Math.round(g / aSum)
        out[o + 2] = Math.round(b / aSum)
      }
      out[o + 3] = Math.round((aSum / Math.max(n, 1)) * 255)
    }
  }
  return { width: outW, height: outH, data: out }
}

export const luminance = (r, g, b) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
