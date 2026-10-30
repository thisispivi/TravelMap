import { TransportMode } from "@travelmap/core";
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  ReactNode,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { isSameJson } from "../lib/jsonEquality";

/** How a pin reads on the map: a place slept in, a place passed, or any place. */
type MapPinTone = "stay" | "stop" | "place";

/**
 * One place drawn on the map.
 * @property {string} id - Identifies the pin to the panel that drew it
 * @property {[number, number]} coordinates - Where it stands, as `[lng, lat]`
 * @property {string} label - Its accessible name
 * @property {MapPinTone} tone - How it reads
 * @property {number} [number] - Its position in a trip, printed on the pin
 */
export interface MapPin {
  id: string;
  coordinates: [number, number];
  label: string;
  tone: MapPinTone;
  number?: number;
}

/**
 * One ride drawn on the map.
 * @property {string} id - Identifies the ride to the panel that drew it
 * @property {[number, number]} from - Where it leaves, as `[lng, lat]`
 * @property {[number, number]} to - Where it arrives, as `[lng, lat]`
 * @property {TransportMode} mode - How it travels, which sets its colour and stroke
 * @property {boolean} isOuting - Whether it is part of a day trip, drawn dotted
 */
export interface MapRoute {
  id: string;
  from: [number, number];
  to: [number, number];
  mode: TransportMode;
  isOuting: boolean;
}

/**
 * What the map shows for the panel on screen. Plain data, so two scenes can
 * be compared and the map redraws only when something really changed.
 * @property {MapPin[]} pins - The places
 * @property {MapRoute[]} routes - The rides between them
 * @property {string} [selectedId] - The pin or ride being edited
 * @property {[number, number][]} frame - The points the camera keeps in view; empty leaves it where it is
 */
export interface MapScene {
  pins: MapPin[];
  routes: MapRoute[];
  selectedId?: string;
  frame: [number, number][];
}

/**
 * What the panel on screen does when the map is used.
 * @property {(id: string) => void} [onSelect] - A pin or ride was pressed
 * @property {(coordinates: [number, number]) => void} [onPick] - An empty spot was pressed
 */
export interface MapSceneHandlers {
  onSelect?: (id: string) => void;
  onPick?: (coordinates: [number, number]) => void;
}

/**
 * Where the camera is, for a panel that saves the view.
 * @property {[number, number]} center - The centre, as `[lng, lat]`
 * @property {number} zoom - The MapLibre zoom
 */
export interface MapView {
  center: [number, number];
  zoom: number;
}

/**
 * The shared map's contract: the scene to draw, the panel's handlers, and a
 * way for a panel to read the camera.
 * @property {MapScene} scene - What to draw
 * @property {Dispatch<SetStateAction<MapScene>>} setScene - Replaces the scene; stable for the provider's life
 * @property {RefObject<MapSceneHandlers>} handlersRef - The current panel's handlers
 * @property {RefObject<(() => MapView | undefined) | null>} viewReaderRef - Set by the map, read by panels
 */
interface MapSceneValue {
  scene: MapScene;
  setScene: Dispatch<SetStateAction<MapScene>>;
  handlersRef: RefObject<MapSceneHandlers>;
  viewReaderRef: RefObject<(() => MapView | undefined) | null>;
}

/** An empty map: no pins, no routes, the camera left alone. */
const EMPTY_SCENE: MapScene = { frame: [], pins: [], routes: [] };

const MapSceneContext = createContext<MapSceneValue | null>(null);

/**
 * MapSceneProvider component
 * Holds the one map the editor keeps on screen behind every panel. A panel
 * describes what it wants drawn; the map renders it, so moving between panels
 * never reloads the map.
 * @component
 * @param {PropsWithChildren} props - The provider props
 * @param {ReactNode} props.children - The editor shell
 * @returns {ReactNode} The provider
 */
export function MapSceneProvider({ children }: PropsWithChildren): ReactNode {
  const [scene, setScene] = useState<MapScene>(EMPTY_SCENE);
  const handlersRef = useRef<MapSceneHandlers>({});
  const viewReaderRef = useRef<(() => MapView | undefined) | null>(null);

  const mapSceneValue: MapSceneValue = {
    handlersRef,
    scene,
    setScene,
    viewReaderRef,
  };

  return (
    /* react-doctor-disable-next-line react-doctor/context-provider-value-from-unmemoized-local-literal -- React Compiler memoizes the value, which the scan cannot see */
    <MapSceneContext.Provider value={mapSceneValue}>
      {children}
    </MapSceneContext.Provider>
  );
}

/**
 * Reads the shared map's contract.
 * @returns {MapSceneValue} The scene, its setter, and the handler and view refs
 */
export function useMapSceneContext(): MapSceneValue {
  const value = useContext(MapSceneContext);
  if (!value)
    throw new Error("useMapSceneContext must be used within MapSceneProvider.");
  return value;
}

/**
 * Shows a panel's scene on the shared map while the panel is on screen, and
 * routes presses on the map to the panel's latest handlers.
 * @param {MapScene} scene - What to draw
 * @param {MapSceneHandlers} [handlers] - What presses on the map do
 * @returns {{ readView: () => MapView | undefined }} A reader for the camera
 */
export function useMapScene(
  scene: MapScene,
  handlers: MapSceneHandlers = {},
): { readView: () => MapView | undefined } {
  const { handlersRef, setScene, viewReaderRef } = useMapSceneContext();

  useEffect(() => {
    handlersRef.current = handlers;
  });

  /*
   * Panels rebuild their scene on every render, so the current one is kept
   * whenever the content is the same, or the map would redraw for nothing.
   */
  useEffect(() => {
    setScene((current) => (isSameJson(current, scene) ? current : scene));
  });

  useEffect(
    () => () => {
      handlersRef.current = {};
      setScene(EMPTY_SCENE);
    },
    [handlersRef, setScene],
  );

  return { readView: () => viewReaderRef.current?.() };
}
