import { useEffect, useRef, useState } from "react";
import { select } from "d3";
import * as d3 from "d3";
import * as topojson from "topojson-client";

interface MapProps {
  topojsonUrl: string;
}

function Map({ topojsonUrl }: MapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [topojsonData, setTopojsonData] = useState<any>(null);
  const [world, setWorld] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(topojsonUrl);
      const topojsonData = await response.json();
      setTopojsonData(topojsonData);
      setWorld(topojson.feature(topojsonData, topojsonData.objects.countries));
    }
    fetchData();
  }, [topojsonUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const svg = svgRef.current;

    const context = canvas?.getContext("2d");

    const zoomHandler = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        console.log(event.transform);
        const transform = event.transform;
        if (canvas && context) {
          const projection = d3
            .geoMercator()
            .fitSize([canvas.width, canvas.height], world);
          const path = d3.geoPath().projection(projection);
          context.save();
          context.restore();
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.translate(transform.x, transform.y);
          context.scale(transform.k, transform.k);

          path.context(context)(world);
          context.fillStyle = "#99aabb";
          context.fill();
          context.restore();
        }
      });

    select(svg).call(zoomHandler as any);

    function draw() {
      if (context && canvas) {
        const projection = d3
          .geoMercator()
          .fitSize([canvas.width, canvas.height], world);
        const path = d3.geoPath().projection(projection);

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        path.context(context)(world);
        context.fillStyle = "#ccc";
        context.fill();
        context.strokeStyle = "#000";
        context.stroke();
      }
    }

    draw();

    return () => {
      select(svg).on(".zoom", null);
    };
  }, [topojsonData, topojsonUrl, world]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <svg
        ref={svgRef}
        width={800}
        height={500}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      ></svg>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />
    </div>
  );
}

export default Map;
