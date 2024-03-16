export interface WorldTopoJson {
  type: string;
  objects: Objects;
  arcs?: ((number[] | null)[] | null)[] | null;
  bbox?: number[] | null;
  transform: Transform;
}
export interface Objects {
  countries: Countries;
  land: Land;
}
export interface Countries {
  type: string;
  geometries?: GeometriesEntity[] | null;
}
export interface GeometriesEntity {
  type: string;
  arcs?: ((number | number[] | null)[] | null)[] | null;
  id?: string | null;
  properties: Properties;
}
export interface Properties {
  name: string;
}
export interface Land {
  type: string;
  geometries?: GeometriesEntity1[] | null;
}
export interface GeometriesEntity1 {
  type: string;
  arcs?: ((number[] | null)[] | null)[] | null;
}
export interface Transform {
  scale?: number[] | null;
  translate?: number[] | null;
}
