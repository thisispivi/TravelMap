import { PixiComponent } from "@pixi/react";
import { Graphics } from "pixi.js";

interface CountriesProps {
  data: {
    type: string;
    features: {
      geometry: {
        type: string;
        coordinates: number[][];
      };
    }[];
  };
}

const Countries = PixiComponent<CountriesProps, Graphics>("Countries", {
  create: () => new Graphics(),
  applyProps: (ins, _, props) => {
    const { data } = props;
    ins.clear();
    ins.beginFill(0x99aabb);
    ins.lineStyle(1, 0x000000);
    [data.features[0]].forEach((feature) => {
      const { geometry } = feature;
      ins.drawPolygon(geometry.coordinates[0].flat());
    });
    ins.endFill();
  },
});

export default Countries;
