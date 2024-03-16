export interface WorldFeatureCollection {
  type: string;
  features?: FeaturesEntity[] | null;
}
export interface FeaturesEntity {
  type: string;
  id?: string | null;
  properties: Properties;
  geometry: Geometry;
}
export interface Properties {
  name: string;
}
export interface Geometry {
  type: string;
  coordinates?: (((number | number[] | null)[] | null)[] | null)[] | null;
}
