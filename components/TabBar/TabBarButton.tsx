import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

type Props = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  color: string;
  buttonSize: number;
  haveUnReadNotifications?: boolean;
};

const icon: {
  [key: string]: (props: any) => JSX.Element;
} = {
  index: (props: any) => <Entypo name="home" {...props} />,
  feed: (props: any) => <Entypo name="home" {...props} />,
  search: (props: any) => <AntDesign name="search1" {...props} />,
  create: (props: any) => <Entypo name="circle-with-plus" {...props} />,
  notifications: (props: any) => <Ionicons name="notifications" {...props} />,
  collectibles: (props: any) => <AntDesign name="star" {...props} />,
};

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  buttonSize,
  haveUnReadNotifications,
}: Props) => {
  const [animatedColor, setAnimatedColor] = useState(color);

  useEffect(() => {
    delay(200).then(() => {
      setAnimatedColor(color);
    });
  }, [color]);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabBarItem}
    >
      {icon[routeName]({
        focused: isFocused,
        color: animatedColor,
        size: buttonSize,
      })}
      {haveUnReadNotifications && (
        <View
          id="red-dot-for-notification"
          style={{ position: "absolute", top: -5, right: 0 }}
        >
          <Entypo name="dot-single" size={48} color="red" />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tabBarItem: {
    width: 65,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TabBarButton;
