import {
  View,
  Text as DefaultTextComponent,
  StyleSheet,
  TextProps,
} from "react-native";
import React, { ReactNode } from "react";

interface CustomTextProps extends TextProps {
  children: ReactNode;
  bold?: boolean;
}

export const Text: React.FC<CustomTextProps> = ({
  style,
  bold,
  children,
  ...props
}) => {
  return (
    <View>
      <DefaultTextComponent
        style={[
          styles.defaultStyle,
          style,
          bold && [{ fontFamily: "Poppins-Bold" }],
        ]}
        {...props}
      >
        {children}
      </DefaultTextComponent>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    color: "white",
    fontSize: 14,
    fontFamily: "Poppins-Regular",
  },
});

export default Text;
