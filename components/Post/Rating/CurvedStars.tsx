import React from "react";
import CurvedStar from "./CurvedStar";

type Location = {
  x: number;
  y: number;
};

type Props = {
  rateValue: number;
  locations: {
    starIndex: number;
    location: Location;
  }[];
};

const CurvedStars = ({ rateValue, locations }: Props) => {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <CurvedStar
          index={i}
          rateValue={rateValue}
          key={i}
          location={
            locations.find((l) => l.starIndex === i)?.location || { x: 0, y: 0 }
          }
        />
      ))}
    </>
  );
};

export default CurvedStars;
