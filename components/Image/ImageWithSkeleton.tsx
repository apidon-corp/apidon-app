import { useRef, useState } from "react";
import {
  AnimatableNumericValue,
  DimensionValue,
  Image,
  ImageProps,
  View,
  Animated,
} from "react-native";

interface ImageWithSkeletonProps extends ImageProps {
  skeletonWidth: DimensionValue;
  skeletonHeight: DimensionValue;
  skeletonBorderRadius: AnimatableNumericValue;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  skeletonWidth,
  skeletonHeight,
  skeletonBorderRadius,
  ...props
}) => {
  const [loading, setLoading] = useState(true);

  const animatedOpacityValue = useRef(new Animated.Value(0)).current;
  const animatedOpacityValueSkeleton = useRef(new Animated.Value(1)).current;

  const handleImageLoadingStarted = () => {
    setLoading(true);
    Animated.timing(animatedOpacityValue, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(animatedOpacityValueSkeleton, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const handleImageLoadingFinished = () => {
    setLoading(false);
    Animated.timing(animatedOpacityValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
    Animated.timing(animatedOpacityValueSkeleton, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  return (
    <>
      <View
        style={{
          position: "relative",
          width: skeletonWidth,
          height: skeletonHeight,
          borderRadius: skeletonBorderRadius,
        }}
      >
        <Animated.View
          style={{
            width: skeletonWidth,
            height: skeletonHeight,
            borderRadius: skeletonBorderRadius,
            backgroundColor: "gray",
            position: "absolute",
            opacity: animatedOpacityValueSkeleton,
          }}
        />

        <Animated.Image
          {...props}
          style={[
            props.style,
            { position: "absolute" },
            { opacity: animatedOpacityValue },
          ]}
          onLoadStart={handleImageLoadingStarted}
          onLoadEnd={handleImageLoadingFinished}
        />
      </View>
    </>
  );
};
