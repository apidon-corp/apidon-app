import React, { useState } from "react";
import { Image } from "expo-image";
import { Zoomable } from "@likashefqet/react-native-image-zoom";
import { View } from "react-native";

type Props = {
  source: string;
  height: number;
};

const PostImage = ({ source, height }: Props) => {
  const [isZooming, setIsZooming] = useState(false);

  return (
    <View
      style={{
        height,
        aspectRatio: 1,
      }}
    >
      <Zoomable
        onPinchStart={() => {
          setIsZooming(true);
        }}
        onPinchEnd={() => {
          setIsZooming(false);
        }}
        style={{
          zIndex: isZooming ? 1 : 0,
          width: "100%",
          height: "100%",
        }}
      >
        <Image
          source={source}
          contentFit="cover"
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </Zoomable>
    </View>
  );
};

export default PostImage;
