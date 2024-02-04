import { PixiComponent, useApp } from "@pixi/react";
import { Viewport as PixiViewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

export interface ViewportProps {
  width: number;
  height: number;
  children?: React.ReactNode;
}

export interface PixiComponentViewportProps extends ViewportProps {
  app: PIXI.Application;
}

/**
 * A wrapper around the PixiViewport component to make it work with React.
 *
 * @param {PixiComponentViewportProps} props
 * @param {PIXI.Application} props.app
 * @param {number} props.width
 * @param {number} props.height
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
const PixiComponentViewport = PixiComponent("Viewport", {
  create: (props: PixiComponentViewportProps) => {
    const viewport = new PixiViewport({
      screenWidth: props.width,
      screenHeight: props.height,
      worldWidth: props.width * 2,
      worldHeight: props.height * 2,
      ticker: props.app.ticker,
      events: props.app.renderer.plugins.interaction,
    });
    viewport.drag().pinch().wheel();

    return viewport;
  },
});

/**
 * A wrapper around the PixiViewport component to make it work with React.
 *
 * @param {ViewportProps} props
 * @param {number} props.width
 * @param {number} props.height
 * @param {React.ReactNode} props.children
 * @returns {JSX.Element}
 */
export default function Viewport(props: ViewportProps): JSX.Element {
  const app = useApp();
  return <PixiComponentViewport app={app} {...props} />;
}
