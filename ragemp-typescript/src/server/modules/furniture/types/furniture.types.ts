// server/modules/furniture/types/furniture.types.ts

export interface FurnitureItem {
  id: string;
  name: string;
  model: string;
  category: string;
  subcategory: string;
  value: number;
  useSlot: boolean;
}

export interface PropertyFurniture {
  id: string;
  model: string;
  propertyId: string;
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  interior: boolean;
}

export interface SerializedFurniture {
  id: string;
  name: string;
  distance: number;
  value: number;
  useSlot: boolean;
}
