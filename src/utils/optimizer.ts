import type { Part, Material, CutSheet, CuttingResult, PlacedPiece } from '../types';

interface FreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PieceToPlace {
  part: Part;
  instanceIndex: number;
  w: number;
  h: number;
  canRotate: boolean;
}

function fits(piece: { w: number; h: number }, space: FreeRect): boolean {
  return piece.w <= space.w && piece.h <= space.h;
}

// Guillotine split: after placing piece at top-left of free rect, split remainder
function splitRect(
  free: FreeRect,
  pw: number,
  ph: number,
): FreeRect[] {
  const result: FreeRect[] = [];
  const rightW = free.w - pw;
  const bottomH = free.h - ph;

  // Right of placed piece
  if (rightW > 0) {
    result.push({ x: free.x + pw, y: free.y, w: rightW, h: free.h });
  }
  // Below placed piece (full width)
  if (bottomH > 0) {
    result.push({ x: free.x, y: free.y + ph, w: pw, h: bottomH });
  }
  return result;
}

function removeOverlapping(freeRects: FreeRect[], x: number, y: number, w: number, h: number): FreeRect[] {
  return freeRects.filter(r => {
    // Keep if no overlap
    return r.x >= x + w || r.x + r.w <= x || r.y >= y + h || r.y + r.h <= y;
  });
}

function placePieces(
  pieces: PieceToPlace[],
  sheetW: number,
  sheetH: number,
  kerf: number,
): { placed: PlacedPiece[]; unplaced: PieceToPlace[] } {
  const freeRects: FreeRect[] = [{ x: 0, y: 0, w: sheetW, h: sheetH }];
  const placed: PlacedPiece[] = [];
  const unplaced: PieceToPlace[] = [];

  for (const piece of pieces) {
    const pw = piece.w + kerf;
    const ph = piece.h + kerf;
    const pwR = piece.h + kerf;
    const phR = piece.w + kerf;

    let bestScore = Infinity;
    let bestFree = -1;
    let bestRotated = false;

    for (let i = 0; i < freeRects.length; i++) {
      const fr = freeRects[i];
      // Normal orientation
      if (fits({ w: pw, h: ph }, fr)) {
        const score = fr.w * fr.h - pw * ph;
        if (score < bestScore) {
          bestScore = score;
          bestFree = i;
          bestRotated = false;
        }
      }
      // Rotated
      if (piece.canRotate && fits({ w: pwR, h: phR }, fr)) {
        const score = fr.w * fr.h - pwR * phR;
        if (score < bestScore) {
          bestScore = score;
          bestFree = i;
          bestRotated = true;
        }
      }
    }

    if (bestFree === -1) {
      unplaced.push(piece);
      continue;
    }

    const fr = freeRects[bestFree];
    const usedW = bestRotated ? pwR : pw;
    const usedH = bestRotated ? phR : ph;
    const actualW = bestRotated ? piece.h : piece.w;
    const actualH = bestRotated ? piece.w : piece.h;

    placed.push({
      partId: piece.part.id,
      partName: piece.part.name,
      x: fr.x,
      y: fr.y,
      w: actualW,
      h: actualH,
      rotated: bestRotated,
      instanceIndex: piece.instanceIndex,
    });

    // Split free rect
    const newFree = splitRect(fr, usedW, usedH);
    freeRects.splice(bestFree, 1);

    // Remove rects overlapping with placed piece
    const cleaned = removeOverlapping(freeRects, fr.x, fr.y, usedW, usedH);
    freeRects.length = 0;
    freeRects.push(...cleaned, ...newFree);
  }

  return { placed, unplaced };
}

export function optimize(
  parts: Part[],
  materials: Material[],
  kerf: number,
): CuttingResult {
  const matMap = new Map(materials.map(m => [m.id, m]));

  // Group parts by material
  const byMaterial = new Map<string, PieceToPlace[]>();
  for (const part of parts) {
    if (!byMaterial.has(part.materialId)) byMaterial.set(part.materialId, []);
    for (let i = 0; i < part.quantity; i++) {
      byMaterial.get(part.materialId)!.push({
        part,
        instanceIndex: i + 1,
        w: part.width,
        h: part.height,
        canRotate: part.canRotate,
      });
    }
  }

  const sheets: CutSheet[] = [];
  const unplacedParts: { part: Part; count: number }[] = [];

  for (const [matId, pieces] of byMaterial.entries()) {
    const mat = matMap.get(matId);
    if (!mat) continue;

    const sheetW = mat.sheetWidth;
    const sheetH = mat.sheetHeight;

    // Sort largest area first
    const sorted = [...pieces].sort((a, b) => b.w * b.h - a.w * a.h);

    let remaining = sorted;
    let sheetIdx = 1;

    while (remaining.length > 0) {
      const { placed, unplaced } = placePieces(remaining, sheetW, sheetH, kerf);

      if (placed.length === 0) {
        // Nothing fits — mark as unplaced
        for (const p of remaining) {
          const existing = unplacedParts.find(u => u.part.id === p.part.id);
          if (existing) existing.count++;
          else unplacedParts.push({ part: p.part, count: 1 });
        }
        break;
      }

      const usedArea = placed.reduce((sum, p) => sum + p.w * p.h, 0);
      const totalArea = sheetW * sheetH;
      const wastePercent = Math.round((1 - usedArea / totalArea) * 100);

      sheets.push({
        sheetIndex: sheetIdx++,
        materialId: matId,
        materialName: mat.name,
        sheetWidth: sheetW,
        sheetHeight: sheetH,
        pieces: placed,
        usedArea,
        wastePercent,
      });

      remaining = unplaced;
    }
  }

  const sheetCounts = new Map<string, number>();
  for (const s of sheets) {
    sheetCounts.set(s.materialId, (sheetCounts.get(s.materialId) ?? 0) + 1);
  }

  let totalCost = 0;
  for (const [matId, count] of sheetCounts.entries()) {
    const mat = matMap.get(matId);
    if (mat) totalCost += mat.price * count;
  }

  return { sheets, totalSheets: sheets.length, totalCost, unplacedParts };
}
