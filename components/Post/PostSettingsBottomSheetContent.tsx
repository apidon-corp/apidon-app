import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { PostServerData } from "@/types/Post";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
import Text from "../Text/Text";

import auth from "@react-native-firebase/auth";
import appCheck from "@react-native-firebase/app-check";
import apiRoutes from "@/helpers/ApiRoutes";

import firestore from "@react-native-firebase/firestore";

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
  const [reportLoading, setReportLoading] = useState<boolean>(false);

  const [reported, setReported] = useState<boolean | null>(null);

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const handleCreateNFTButton = () => {
    if (!postDocData) return;
    if (!postDocData.image) return;

    postOptionsModalRef.current?.close();

    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);

    router.push("/(modals)/createCollectible");
  };

  const handleReportPostButton = () => {
    if (reported) {
      return Alert.alert(
        "Post Already Reported",
        "Our team is currently investigating this post. Thank you for your patience.",
        [
          {
            text: "OK",
          },
        ]
      );
    }

    if (reportLoading) return;

    Alert.alert(
      "Report Post",
      "Are you sure you want to report this post?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Report",
          onPress: () => {
            handleReportPost();
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleReportPost = async () => {
    if (reportLoading) return;

    const currentUserAuthObject = auth().currentUser;
    if (!currentUserAuthObject) return;

    setReportLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();
      const { token: appchecktoken } = await appCheck().getLimitedUseToken();
      const response = await fetch(apiRoutes.post.postReport, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
          appchecktoken,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from report post api is not okay: \n",
          await response.text()
        );
        return setReportLoading(false);
      }

      setReportLoading(false);

      // Good to go.
      return Alert.alert(
        "Post Reported",
        "Post has been reported successfully.",
        [
          {
            text: "OK",
          },
        ]
      );
    } catch (error) {
      console.error("Error on reporting post: ", error);
      return setReportLoading(false);
    }
  };

  useEffect(() => {
    if (doesOwnPost) return;

    const displayName = auth().currentUser?.displayName;
    if (!displayName) return;

    const unsubscribe = firestore()
      .doc(postDocPath)
      .collection("reports")
      .doc(displayName)
      .onSnapshot(
        (snapshot) => {
          setReported(snapshot.exists);
        },
        (error) => {
          console.error("Error on fetching report: ", error);
          setReported(null);
        }
      );
    return () => unsubscribe();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        gap: 10,
      }}
    >
      {doesOwnPost &&
        postDocData.image &&
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

      {doesOwnPost && (
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
      )}

      {!doesOwnPost && (
        <Pressable
          onPress={handleReportPostButton}
          style={{
            padding: 10,
            borderRadius: 10,
            backgroundColor: "red",
            width: "100%",
            alignItems: "center",
          }}
        >
          {reportLoading || reported === null ? (
            <ActivityIndicator color="white" size="small" />
          ) : reported ? (
            <Text bold style={{ fontSize: 15 }}>
              Reported (Investigating)
            </Text>
          ) : (
            <Text bold style={{ fontSize: 15 }}>
              Report Post
            </Text>
          )}
        </Pressable>
      )}
    </View>
  );
};

export default PostSettingsBottomSheetContent;
