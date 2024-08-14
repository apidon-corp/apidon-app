import React, { useState } from "react";

import { Image } from "expo-image";

import { Zoomable } from "@likashefqet/react-native-image-zoom";

type Props = {
  source: string;
};

const PostImage = ({ source }: Props) => {
  const [isZooming, setIsZooming] = useState(false);

  return (
    <Zoomable
      onPinchStart={() => {
        setIsZooming(true);
      }}
      onPinchEnd={() => {
        setIsZooming(false);
      }}
      style={{
        zIndex: isZooming ? 1 : 0,
      }}
    >
      <Image
        source={source}
        style={{
          width: "100%",
          aspectRatio: 1,
        }}
        transition={50}
      />
    </Zoomable>
  );
};

export default PostImage;
