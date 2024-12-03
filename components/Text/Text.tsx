import {
  Text as DefaultTextComponent,
  StyleSheet,
  TextProps,
  Platform,
} from "react-native";
import React, { ReactNode } from "react";

interface CustomTextProps extends TextProps {
  children: ReactNode;
  bold?: boolean;
  fontSize?: number;
}

export const Text: React.FC<CustomTextProps> = ({
  style,
  bold,
  fontSize,
  children,
  ...props
}) => {
  return (
    <DefaultTextComponent
      style={[
        styles.defaultStyle,
        // Android-specific text alignment fix
        Platform.select({
          android: {
            includeFontPadding: false,
            textAlignVertical: "center",
            lineHeight: undefined, // Remove any existing lineHeight
          },
        }),
        style,
        bold ? { fontFamily: "Poppins-Bold" } : undefined,
        fontSize ? { fontSize: fontSize } : undefined,
      ]}
      {...props}
    >
      {children}
    </DefaultTextComponent>
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
