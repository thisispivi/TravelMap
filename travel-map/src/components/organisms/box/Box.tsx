import { PropsWithChildren, useEffect, useState } from "react";
import { CloseButton } from "../../atoms";
import { Backdrop, CountryFlag } from "../../atoms";

import "./Box.scss";
import { Row } from "../../molecules";
import { City } from "../../../classes/City";

interface BoxProps extends PropsWithChildren {
  city: City;
  className?: string;
  onClose: () => void;
  overflow?: string;
}

export function Box({
  city,
  className = "",
  onClose,
  children,
  overflow = "auto",
}: BoxProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
  }, []);

  const closeBox = () => {
    setShowContent(false);
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <>
      <Backdrop onClick={closeBox} />
      <div className={`box ${className} ${showContent ? "show" : ""}`}>
        <div className="header">
          <Row>
            <h1>{city.name}</h1>
            <CountryFlag id={city.country.id} />
          </Row>
          <CloseButton onClick={closeBox} />
        </div>
        <div className="content" style={{ overflow: overflow }}>
          {children}
        </div>
      </div>
    </>
  );
}
