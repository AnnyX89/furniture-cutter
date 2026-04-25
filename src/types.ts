export interface Material {
  id: string;
  name: string;
  sheetWidth: number;
  sheetHeight: number;
  thickness: number;
  price: number;
  color: string;
  hasTexture: boolean;
}

export interface EdgeBanding {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export interface Part {
  id: string;
  name: string;
  width: number;
  height: number;
  quantity: number;
  materialId: string;
  canRotate: boolean;
  edgeBanding: EdgeBanding;
}

export interface EdgeBandingMaterial {
  id: string;
  name: string;
  color: string;
  width: number;        // мм: 19, 22, 44...
  pricePerMeter: number;
  materialId?: string;  // привязка к плите для цветового соответствия
}

export interface HardwareItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;         // шт / пара / компл. / м
  notes: string;
}

export interface RoomDesign {
  room: { width: number; height: number; wallColor: string; floorColor: string; ceilingColor: string };
  items: unknown[];
  doors: unknown[];
  windows: unknown[];
  niches: unknown[];
}

export interface Project {
  id: string;
  name: string;
  kerf: number;
  materials: Material[];
  parts: Part[];
  edgeBandingMaterials?: EdgeBandingMaterial[];
  hardware?: HardwareItem[];
  design?: RoomDesign;
  createdAt: string;
  updatedAt: string;
}

export interface PlacedPiece {
  partId: string;
  partName: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
  instanceIndex: number;
}

export interface CutSheet {
  sheetIndex: number;
  materialId: string;
  materialName: string;
  sheetWidth: number;
  sheetHeight: number;
  pieces: PlacedPiece[];
  usedArea: number;
  wastePercent: number;
}

export interface CuttingResult {
  sheets: CutSheet[];
  totalSheets: number;
  totalCost: number;
  unplacedParts: { part: Part; count: number }[];
}

export type TabId = 'materials' | 'parts' | 'cutting' | 'reports' | 'designer' | 'hardware' | 'buy' | 'help';
