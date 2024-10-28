import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { PostServerData } from "@/types/Post";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React from "react";
import { Pressable, View } from "react-native";
import Text from "../Text/Text";

type Props = {
  postDocData: PostServerData;
  doesOwnPost: boolean;
  postOptionsModalRef: React.RefObject<BottomSheetModal>;
  postDocPath: string;
  handleDeleteButton: () => void;
};

const PostSettingsBottomSheetContent = ({
  postDocData,
  doesOwnPost,
  postOptionsModalRef,
  postDocPath,
  handleDeleteButton,
}: Props) => {
  const setScreenParameters = useSetAtom(screenParametersAtom);

  const handleCreateNFTButton = () => {
    if (!postDocData) return;
    if (!postDocData.image) return;

    postOptionsModalRef.current?.close();

    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);

    router.push("/(modals)/createCollectible");
  };

  return (
    <View
      style={{
        flex: 1,
        gap: 10,
      }}
    >
      {postDocData.image &&
        !postDocData.collectibleStatus.isCollectible &&
        doesOwnPost && (
          <Pressable
            onPress={handleCreateNFTButton}
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor: "#e52165",
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text bold style={{ fontSize: 15 }}>
              Create Collectible
            </Text>
          </Pressable>
        )}

      <Pressable
        disabled={postDocData.collectibleStatus.isCollectible}
        style={{
          opacity: postDocData.collectibleStatus.isCollectible ? 0.5 : 1,
          padding: 10,
          borderRadius: 10,
          backgroundColor: "black",
          width: "100%",
          alignItems: "center",
        }}
        onPress={handleDeleteButton}
      >
        <Text
          bold
          style={{
            fontSize: 15,
          }}
        >
          Delete Post
        </Text>
      </Pressable>
    </View>
  );
};

export default PostSettingsBottomSheetContent;
