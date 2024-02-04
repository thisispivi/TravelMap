import { Stage } from "@pixi/react";
import useResize from "../../../hooks/viewport";
import { Viewport } from "../../organisms";
import Countries from "../../atoms";

interface HomeTemplateProps {
  countries: {
    type: string;
    features: {
      geometry: {
        type: string;
        coordinates: number[][];
      };
    }[];
  };
}

export default function HomeTemplate({ countries }: HomeTemplateProps) {
  const size = useResize();

  return (
    <div className="home-template">
      <Stage
        width={size[0]}
        height={size[1]}
        options={{
          antialias: true,
          resolution: 1,
        }}
      >
        <Viewport width={1000} height={600}>
          <Countries data={countries} />
        </Viewport>
      </Stage>
    </div>
  );
}
