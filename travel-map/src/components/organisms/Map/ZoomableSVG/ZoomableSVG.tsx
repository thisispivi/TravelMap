import { PropsWithChildren, useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface ZoomableSVGProps extends PropsWithChildren {
  width: number;
  height: number;
}

export function ZoomableSVG({ children, width, height }: ZoomableSVGProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [k, setK] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  useEffect(() => {
    const zoom = d3.zoom().on("zoom", (event) => {
      const { x, y, k } = event.transform;
      setK(k);
      setX(x);
      setY(y);
    });
    d3.select(svgRef.current).call(zoom as any);
  }, []);

  return (
    <svg ref={svgRef} width={width} height={height}>
      <g transform={`translate(${x},${y})scale(${k})`}>{children}</g>
    </svg>
  );
}
