import React from "react";
import { ActivityIndicator, View } from "react-native";

const PostSkeleton = ({ height }: { height?: number }) => {
  return (
    <View
      style={{
        width: "100%",
        height: height || 630,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 25,
        paddingHorizontal : 5,
      }}
    >
      <ActivityIndicator color="white" />
    </View>
  );
};

export default PostSkeleton;
