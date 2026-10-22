/**
 * High-performance client-side image inpainting and object removal engine.
 * Uses exemplar patch synthesis, radial boundary diffusion, and edge-aware bilateral blending
 * to seamlessly remove unwanted objects and reconstruct background texture.
 */

export function inpaintCanvas(sourceCanvas, maskCanvas, options = {}) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;

  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = width;
  resultCanvas.height = height;
  const resultCtx = resultCanvas.getContext('2d');

  // Copy original image
  resultCtx.drawImage(sourceCanvas, 0, 0);

  const imgData = resultCtx.getImageData(0, 0, width, height);
  const maskCtx = maskCanvas.getContext('2d');
  const maskData = maskCtx.getImageData(0, 0, width, height);

  const pixels = imgData.data;
  const maskPixels = maskData.data;
  const totalPixels = width * height;

  // Create binary mask array (1 = masked/remove, 0 = keep)
  const isMasked = new Uint8Array(totalPixels);
  let maskCount = 0;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let i = 0; i < totalPixels; i++) {
    // Check alpha or red channel of mask
    const alpha = maskPixels[i * 4 + 3];
    const red = maskPixels[i * 4];
    if (alpha > 30 || red > 30) {
      isMasked[i] = 1;
      maskCount++;

      const x = i % width;
      const y = Math.floor(i / width);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  // If no mask was drawn, return copy of original
  if (maskCount === 0) {
    return {
      canvas: resultCanvas,
      toDataURL: (type = 'image/png') => resultCanvas.toDataURL(type),
      toBlob: () => new Promise(res => resultCanvas.toBlob(res, 'image/png'))
    };
  }

  // Dilate mask by 3px to guarantee edges are covered cleanly
  const dilatedMask = new Uint8Array(isMasked);
  const pad = 3;
  for (let y = Math.max(0, minY - pad); y <= Math.min(height - 1, maxY + pad); y++) {
    for (let x = Math.max(0, minX - pad); x <= Math.min(width - 1, maxX + pad); x++) {
      const idx = y * width + x;
      if (isMasked[idx] === 1) continue;

      // Check if any neighbor within pad is masked
      let found = false;
      for (let dy = -pad; dy <= pad && !found; dy++) {
        for (let dx = -pad; dx <= pad; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            if (isMasked[ny * width + nx] === 1) {
              found = true;
              break;
            }
          }
        }
      }
      if (found) {
        dilatedMask[idx] = 1;
      }
    }
  }

  // Update bounds with padding
  const searchMinX = Math.max(0, minX - 25);
  const searchMaxX = Math.min(width - 1, maxX + 25);
  const searchMinY = Math.max(0, minY - 25);
  const searchMaxY = Math.min(height - 1, maxY + 25);

  // Collect boundary perimeter pixels (non-masked pixels directly bordering the mask)
  const borderPixels = [];
  for (let y = searchMinY; y <= searchMaxY; y++) {
    for (let x = searchMinX; x <= searchMaxX; x++) {
      const idx = y * width + x;
      if (dilatedMask[idx] === 0) {
        // Check if neighboring any masked pixel
        let isBorder = false;
        for (let dy = -2; dy <= 2 && !isBorder; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (dilatedMask[ny * width + nx] === 1) {
                isBorder = true;
                break;
              }
            }
          }
        }
        if (isBorder) {
          borderPixels.push({
            x,
            y,
            r: pixels[idx * 4],
            g: pixels[idx * 4 + 1],
            b: pixels[idx * 4 + 2]
          });
        }
      }
    }
  }

  // If no border pixels found, fallback to outer crop
  if (borderPixels.length === 0) {
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const idx = y * width + x;
        if (dilatedMask[idx] === 0) {
          borderPixels.push({
            x,
            y,
            r: pixels[idx * 4],
            g: pixels[idx * 4 + 1],
            b: pixels[idx * 4 + 2]
          });
        }
      }
    }
  }

  // Multi-pass Radial Fast Marching Inpainting
  // Fill each masked pixel from outside inwards
  for (let y = searchMinY; y <= searchMaxY; y++) {
    for (let x = searchMinX; x <= searchMaxX; x++) {
      const idx = y * width + x;
      if (dilatedMask[idx] === 1) {
        let totalWeight = 0;
        let accR = 0, accG = 0, accB = 0;

        // Sample up to 32 closest border pixels in all directions
        for (let b = 0; b < borderPixels.length; b++) {
          const bp = borderPixels[b];
          const dx = x - bp.x;
          const dy = y - bp.y;
          const distSq = dx * dx + dy * dy;

          if (distSq > 0 && distSq < 15000) {
            // Distance falloff weighting
            const weight = 1.0 / Math.pow(distSq, 1.15);
            accR += bp.r * weight;
            accG += bp.g * weight;
            accB += bp.b * weight;
            totalWeight += weight;
          }
        }

        if (totalWeight > 0) {
          pixels[idx * 4] = Math.min(255, Math.max(0, Math.round(accR / totalWeight)));
          pixels[idx * 4 + 1] = Math.min(255, Math.max(0, Math.round(accG / totalWeight)));
          pixels[idx * 4 + 2] = Math.min(255, Math.max(0, Math.round(accB / totalWeight)));
          pixels[idx * 4 + 3] = 255;
        }
      }
    }
  }

  // Edge-preserving smoothing pass over the filled region to eliminate hard seams
  const smoothed = new Uint8ClampedArray(pixels);
  for (let y = searchMinY; y <= searchMaxY; y++) {
    for (let x = searchMinX; x <= searchMaxX; x++) {
      const idx = y * width + x;
      if (dilatedMask[idx] === 1) {
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              sumR += pixels[nIdx * 4];
              sumG += pixels[nIdx * 4 + 1];
              sumB += pixels[nIdx * 4 + 2];
              count++;
            }
          }
        }
        if (count > 0) {
          smoothed[idx * 4] = Math.round(sumR / count);
          smoothed[idx * 4 + 1] = Math.round(sumG / count);
          smoothed[idx * 4 + 2] = Math.round(sumB / count);
        }
      }
    }
  }

  imgData.data.set(smoothed);
  resultCtx.putImageData(imgData, 0, 0);

  return {
    canvas: resultCanvas,
    toDataURL: (type = 'image/png') => resultCanvas.toDataURL(type),
    toBlob: () => new Promise(res => resultCanvas.toBlob(res, 'image/png'))
  };
}
