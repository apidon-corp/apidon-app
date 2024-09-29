import React from "react";
import { ActivityIndicator, View } from "react-native";

const PostSkeleton = () => {
  return (
    <View
      style={{
        padding: 15,
      }}
    >
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.1)",
          borderRadius: 25,
        }}
      >
        <ActivityIndicator color="white" />
      </View>
    </View>
  );
};

export default PostSkeleton;
