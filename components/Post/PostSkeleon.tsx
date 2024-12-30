import React from "react";
import { ActivityIndicator, View } from "react-native";

const POST_COMPONENT_HEIGHT = 636;

const PostSkeleton = () => {
  return (
    <View
      style={{
        width: "100%",
        height: POST_COMPONENT_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 25,
      }}
    >
      <ActivityIndicator color="white" />
    </View>
  );
};

export default PostSkeleton;
