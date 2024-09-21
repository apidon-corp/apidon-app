import {
  AntDesign,
  Entypo,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Props = {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  color: string;
};

const icon: {
  [key: string]: (props: any) => JSX.Element;
} = {
  index: (props: any) => <Entypo name="home" size={24} {...props} />,
  feed: (props: any) => <Entypo name="home" size={24} {...props} />,
  search: (props: any) => <AntDesign name="search1" size={24} {...props} />,
  create: (props: any) => (
    <Entypo name="circle-with-plus" size={24} {...props} />
  ),
  notifications: (props: any) => (
    <Ionicons name="notifications" size={24} {...props} />
  ),
  collectibles: (props: any) => (
    <MaterialCommunityIcons name="shopping" size={24} {...props} />
  ),
};

const TabBarButton = ({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabBarItem}
    >
      {icon[routeName]({
        focused: isFocused,
        color: color,
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
