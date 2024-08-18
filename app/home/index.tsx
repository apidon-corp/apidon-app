import { Redirect } from "expo-router";
import React from "react";

const index = () => {
  return <Redirect href="/home/feed" />;
};

export default index;
