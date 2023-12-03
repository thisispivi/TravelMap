// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';
// import * as topojson from 'topojson-client';

// interface MapProps {
//   topojsonUrl: string;
// }

// const Map: React.FC<MapProps> = ({ topojsonUrl }) => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     const context = canvas.getContext('2d');

//     const drawMap = async () => {
//       const response = await fetch(topojsonUrl);
//       const topojsonData = await response.json();
//       const world = topojson.feature(topojsonData, topojsonData.objects.countries);

//       const projection = d3.geoMercator().fitSize([canvas.width, canvas.height], world);
//       const path = d3.geoPath().projection(projection);

//       context.clearRect(0, 0, canvas.width, canvas.height);
//       context.beginPath();
//       path.context(context)(world);
//       context.fillStyle = '#ccc';
//       context.fill();
//       context.strokeStyle = '#000';
//       context.stroke();
//     };

//     drawMap();
//   }, [topojsonUrl]);

//   return <canvas ref={canvasRef} />;
// };

// export default Map;
