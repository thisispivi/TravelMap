export interface WorldData {
  type: string;
  objects: Objects;
  arcs: Array<Array<number[]>>;
  bbox: number[];
  transform: Transform;
}

export interface Objects {
  countries: Countries;
  land: Land;
}

export interface Countries {
  type: string;
  geometries: CountriesGeometry[];
}

export interface CountriesGeometry {
  type: Type;
  arcs: Array<Array<number[] | number>>;
  id?: string;
  properties: Properties;
}

export interface Properties {
  name: string;
}

export enum Type {
  MultiPolygon = "MultiPolygon",
  Polygon = "Polygon",
}

export interface Land {
  type: string;
  geometries: LandGeometry[];
}

export interface LandGeometry {
  type: Type;
  arcs: Array<Array<number[]>>;
}

export interface Transform {
  scale: number[];
  translate: number[];
}
