/* eslint-disable @typescript-eslint/no-explicit-any */
import { WorldFeatureCollection } from "../typings/feature";
import { WorldTopoJson } from "../typings/topojson";
import * as topojson from "topojson-client";
import * as THREE from "three";

/**
 * Convert the topojson data to a WorldFeatureCollection
 * @param {WorldTopoJson} data - The topojson data
 * @returns {WorldFeatureCollection} - The converted data
 */
export function convertTopoJsonToWorldFeaturesCollection(
  data: WorldTopoJson
): WorldFeatureCollection {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const world = topojson.feature(data, data.objects.countries);
  return world as WorldFeatureCollection;
}

/**
 * Get the first point of a geometry
 * @param {Geometry} g - The geometry
 * @returns {{firstX: number | null; firstY: number | null}} - The first point
 */
export function getFirstPoint(g: any): {
  firstX: number | null;
  firstY: number | null;
} {
  const firstPoint = g?.[0];
  const firstX = firstPoint?.[0];
  const firstY = firstPoint?.[1];
  if (!firstX || !firstY) return { firstX: null, firstY: null };
  return { firstX, firstY };
}

/**
 * Move to a point
 * @param {THREE.Shape} shape - The shape
 * @param {any} p - The point
 */
export function moveToPoint(shape: THREE.Shape, p: any) {
  const { firstX, firstY } = getFirstPoint(p);
  if (!firstX || !firstY) return;
  shape.moveTo(firstX as number, firstY as number);
}

/**
 * Draw a shape line
 * @param {THREE.Shape} shape - The shape
 * @param {any} p - The point
 */
export function drawShapeLine(shape: THREE.Shape, p: any) {
  if (!p || !(p instanceof Array)) return;
  const point = new THREE.Vector2(p[0] as number, p[1] as number);
  shape.lineTo(point.x, point.y);
}
