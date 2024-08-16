import { Redirect } from "expo-router";
import React from "react";

type Props = {};

const index = (props: Props) => {
  return <Redirect href="/home/feed" />;
};

export default index;
