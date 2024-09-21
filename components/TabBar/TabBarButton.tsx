import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  color: string;
  buttonSize: number;
};

const icon: {
  [key: string]: (props: any) => JSX.Element;
} = {
  index: (props: any) => <Entypo name="home"  {...props} />,
  feed: (props: any) => <Entypo name="home" {...props} />,
  search: (props: any) => <AntDesign name="search1" {...props} />,
  create: (props: any) => <Entypo name="circle-with-plus" {...props} />,
  notifications: (props: any) => <Ionicons name="notifications" {...props} />,
  collectibles: (props: any) => (
    <MaterialCommunityIcons name="shopping" {...props} />
  ),
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
}: Props) => {
  const [animatedColor, setAnimatedColor] = useState(color);

  useEffect(() => {
    delay(250).then(() => {
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
