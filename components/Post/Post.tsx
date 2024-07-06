import { Text } from "@/components/Text/Text";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  View,
} from "react-native";
import { auth, firestore } from "@/firebase/client";
import { PostServerData } from "@/types/Post";
import { UserInServer } from "@/types/User";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Entypo, Feather } from "@expo/vector-icons";
import { screenParametersAtom } from "@/atoms/screenParamatersAtom";
import { useAuth } from "@/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useSetAtom } from "jotai";
import RateStar from "./Rating/RateStar";
import Stars from "./Rating/Stars";
import CustomBottomModalSheet from "../BottomSheet/CustomBottomModalSheet";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { apidonPink } from "@/constants/Colors";

type Props = {
  postDocPath: string;
};

const Post = ({ postDocPath }: Props) => {
  const authStatus = useAuth();

  const [loading, setLoading] = useState(false);

  const [postDocData, setPostDocData] = useState<PostServerData | null>(null);
  const [postSenderData, setPostSenderData] = useState<UserInServer | null>(
    null
  );

  const setScreenParameters = useSetAtom(screenParametersAtom);

  const [doesOwnPost, setDoesOwnPost] = useState(false);

  const [doesFollow, setDoesFollow] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const [postDeleteLoading, setPostDeleteLoading] = useState(false);
  const [postDeleted, setPostDeleted] = useState(false);

  const animatedScaleValue = useRef(new Animated.Value(1)).current;

  const postOptionsModalRef = useRef<BottomSheetModal>(null);

  const nftOptionsModalRef = useRef<BottomSheetModal>(null);

  const overallRating = useMemo(() => {
    if (!postDocData) return 0;

    // Prevent 0-division
    const rateCount = postDocData.rates.length ? postDocData.rates.length : 1;

    let totalRates = postDocData.rates.reduce(
      (acc, current) => acc + current.rate,
      0
    );

    return totalRates / rateCount;
  }, [postDocData?.rates]);

  // Dynamic Data Fetching / Post Object
  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (postDeleted) return;

    setLoading(true);

    const postDocRef = doc(firestore, postDocPath);
    const unsubscribe = onSnapshot(
      postDocRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          console.log("Post's realtime data can not be fecthed.");
          return setLoading(false);
        }
        const postDocData = snapshot.data() as PostServerData;
        setPostDocData(postDocData);

        if (!postSenderData)
          handleGetPostSenderInformation(postDocData.senderUsername);

        setDoesOwnPost(
          postDocData.senderUsername === auth.currentUser?.displayName
        );

        return setLoading(false);
      },
      (error) => {
        console.error("Error on getting realtime data: ", error);
        return setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [postDocPath, authStatus, postDeleted]);

  // Dynamic Data Fetching / Current User
  useEffect(() => {
    if (authStatus !== "authenticated") return;

    const displayName = auth.currentUser?.displayName;
    if (!displayName) return;

    if (!postDocData) return;

    const postSenderFollowingDocOnCurrentUser = doc(
      firestore,
      `/users/${postDocData.senderUsername}/followers/${displayName}`
    );
    const unsubscribe = onSnapshot(
      postSenderFollowingDocOnCurrentUser,
      (snapshot) => {
        if (!snapshot.exists()) {
          setDoesFollow(false);
        } else {
          setDoesFollow(true);
        }
      },
      (error) => {
        console.error("Error on getting realtime data: ", error);
      }
    );

    return () => unsubscribe();
  }, [authStatus, postDocData?.senderUsername]);

  const handleGetPostSenderInformation = async (senderUsername: string) => {
    try {
      const userDocRef = doc(firestore, `/users/${senderUsername}`);

      const userDocSnapshot = await getDoc(userDocRef);
      if (!userDocSnapshot.exists()) return setPostSenderData(null);

      const userDocData = userDocSnapshot.data() as UserInServer;

      return setPostSenderData(userDocData);
    } catch (error) {
      console.error("Error on getting initial data: ", error);
      return setPostSenderData(null);
    }
  };

  const handleOpenRatesModal = () => {
    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);
    router.push("/(modals)/rates");
  };

  const handleOpenCommentsModal = () => {
    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);
    router.push("/(modals)/comments");
  };

  const handleOptionsButton = () => {
    postOptionsModalRef.current?.present();
  };

  const handleDeleteButton = () => {
    postOptionsModalRef.current?.close();
    Alert.alert("Delete Post", "Are you sure to delete this post?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        style: "destructive",
        text: "Delete",
        onPress: handleDeletePost,
      },
    ]);
  };

  const handleDeletePost = async () => {
    if (postDeleteLoading) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.log("No user is logged in.");

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl)
      return console.error("User panel base url couldnt fetch from .env file");

    const route = `${userPanelBaseUrl}/api/postv2/postDelete`;

    setPostDeleteLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          postDocPath: postDocPath,
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        setPostDeleteLoading(false);
        return console.error(
          "Response from deletePost API is not okay: ",
          message
        );
      }

      Animated.timing(animatedScaleValue, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setPostDeleteLoading(false);
        return setPostDeleted(true);
      });
    } catch (error) {
      setPostDeleteLoading(false);
      return console.error("Error on deleting post: ", error);
    }
  };

  const handleCreateNFTButton = () => {
    if (!postDocData) return;
    if (!postDocData.image) return;

    postOptionsModalRef.current?.close();

    setScreenParameters([{ queryId: "postDocPath", value: postDocPath }]);

    router.push("/(modals)/createNFT");
  };

  const handleFollowButton = async () => {
    if (followLoading) return;
    if (!postDocData?.senderUsername) return;

    const currentUserAuthObject = auth.currentUser;
    if (!currentUserAuthObject) return console.error("No user found!");

    const userPanelBaseUrl = process.env.EXPO_PUBLIC_USER_PANEL_ROOT_URL;
    if (!userPanelBaseUrl)
      return console.error("User panel base url couldnt fetch from .env file");

    const route = `${userPanelBaseUrl}/api/social/follow`;

    setFollowLoading(true);

    try {
      const idToken = await currentUserAuthObject.getIdToken();

      const response = await fetch(route, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          operationTo: postDocData.senderUsername,
          opCode: 1,
        }),
      });

      if (!response.ok) {
        console.error(
          "Response from follow API is not okay: ",
          await response.text()
        );
        return setFollowLoading(false);
      }

      setDoesFollow(true);
      return setFollowLoading(false);
    } catch (error) {
      console.error("Error on fetching follow API: : ", error);
      return setFollowLoading(false);
    }
  };

  const handleNFTButton = () => {
    nftOptionsModalRef.current?.present();
  };

  if (loading)
    return (
      <View
        style={{
          width: "100%",
          height: 500,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="white" />
      </View>
    );

  if (!postDocData || !postSenderData || postDeleted) return <></>;

  return (
    <>
      <Animated.View
        id="post-root"
        style={[
          {
            width: "100%",
            transform: [
              {
                scale: animatedScaleValue,
              },
            ],
          },
        ]}
      >
        <View
          id="header"
          style={{
            width: "100%",
            height: 75,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 10,
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <Pressable
            style={{
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
            }}
            onPress={() => {
              router.push(`/home/profile/${postSenderData.username}`);
            }}
          >
            <Image
              source={postSenderData.profilePhoto}
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
              }}
              transition={500}
            />
            <View
              id="username-fullname-time"
              style={{
                flexDirection: "row",
                gap: 5,
              }}
            >
              <View
                id="username-fullname"
                style={{
                  gap: 1,
                }}
              >
                <Text
                  bold
                  style={{
                    fontSize: 15,
                  }}
                >
                  {postSenderData.username}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 15,
                    }}
                  >
                    {postSenderData.fullname}
                  </Text>
                  <Entypo name="dot-single" size={15} color="gray" />
                  <Text style={{ fontSize: 12, color: "gray" }}>
                    {formatDistanceToNow(new Date(postDocData.creationTime))}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
          {postDocData.nftStatus.convertedToNft && (
            <Pressable
              onPress={handleNFTButton}
              style={{
                borderWidth: 1,
                borderColor: apidonPink,
                borderRadius: 10,
                padding: 5,
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Text
                bold
                style={{
                  color: apidonPink,
                }}
              >
                NFT
              </Text>
              <Text>by</Text>
              <Text bold>{postSenderData.username}</Text>
            </Pressable>
          )}
          {doesOwnPost ? (
            <Pressable
              onPress={handleOptionsButton}
              disabled={postDeleteLoading}
            >
              {postDeleteLoading ? (
                <ActivityIndicator color="red" />
              ) : (
                <Entypo name="dots-three-vertical" size={18} color="white" />
              )}
            </Pressable>
          ) : (
            !doesFollow && (
              <Pressable
                onPress={handleFollowButton}
                style={{
                  padding: 5,
                }}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Feather name="user-plus" size={24} color="white" />
                )}
              </Pressable>
            )
          )}
        </View>

        {postDocData.image && (
          <Image
            source={postDocData.image}
            style={{
              width: "100%",
              height: 350,
            }}
            transition={500}
          />
        )}

        <View
          id="footer"
          style={{
            width: "100%",
            gap: 5,
            paddingHorizontal: 5,
          }}
        >
          <View
            id="stars-star-share"
            style={{
              width: "100%",
              height: 75,
              flexDirection: "row",
              alignContent: "center",
              justifyContent: "space-between",
            }}
          >
            <Pressable
              onPress={handleOpenRatesModal}
              style={{
                width: "33%",
                justifyContent: "center",
                gap: 5,
              }}
            >
              <Stars score={overallRating} />
              <View style={{ flexDirection: "row" }}>
                <Text bold>{overallRating.toFixed(2)}</Text>
                <Text> average</Text>
              </View>
            </Pressable>

            <View
              style={{
                width: "33%",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
              }}
            >
              <RateStar
                previousValue={
                  postDocData.rates.find(
                    (r) => r.sender === auth.currentUser?.displayName
                  )?.rate
                }
                postDocPath={postDocPath}
              />
              <Pressable />
            </View>

            <View
              style={{
                width: "33%",
                justifyContent: "center",
                alignItems: "flex-end",
                paddingRight: 5,
              }}
            >
              <Feather name="share-2" size={24} color="white" />
            </View>
          </View>

          <Pressable onPress={handleOpenCommentsModal} style={{ height: 50 }}>
            <View
              id="comments-preview"
              style={{
                gap: 3,
              }}
            >
              <View
                id="description"
                style={{
                  flexDirection: "row",
                  gap: 6,
                }}
              >
                <Text bold>{postSenderData.username}</Text>
                <Text>{postDocData.description}</Text>
              </View>
              <View
                id="comment-count"
                style={{
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "gray",
                  }}
                >
                  {postDocData.commentCount ? postDocData.commentCount : 0}{" "}
                  comments
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      </Animated.View>

      <CustomBottomModalSheet ref={postOptionsModalRef} snapPoint="25%">
        <View
          style={{
            flex: 1,
            gap: 10,
          }}
        >
          {postDocData.image && !postDocData.nftStatus.convertedToNft && (
            <Pressable
              onPress={handleCreateNFTButton}
              style={{
                padding: 10,
                borderRadius: 10,
                backgroundColor: apidonPink,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text bold style={{ fontSize: 16 }}>
                Create NFT
              </Text>
            </Pressable>
          )}

          <Pressable
            style={{
              padding: 10,
              borderRadius: 10,
              backgroundColor: "red",
              width: "100%",
              alignItems: "center",
            }}
            onPress={handleDeleteButton}
          >
            <Text
              bold
              style={{
                fontSize: 16,
              }}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      </CustomBottomModalSheet>

      <CustomBottomModalSheet
        ref={nftOptionsModalRef}
        snapPoint="40%"
        backgroundColor="#1B1B1B"
      >
        <View
          style={{
            flex: 1,
            gap: 10,
          }}
        >
          <View
            id="creator-information"
            style={{
              flexDirection: "row",
              backgroundColor: "#323232",
              padding: 20,
              justifyContent: "space-between",
              borderRadius: 10,
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
              }}
            >
              <Text
                bold
                style={{
                  fontSize: 18,
                }}
              >
                Creator
              </Text>
              <View id="username-fullaname">
                <Text
                  bold
                  style={{
                    fontSize: 12,
                  }}
                >
                  {postSenderData.username}
                </Text>
                <Text
                  bold
                  style={{
                    fontSize: 14,
                  }}
                >
                  {postSenderData.fullname}
                </Text>
              </View>
            </View>
            <View>
              <Image
                source={postSenderData.profilePhoto}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}
              />
            </View>
          </View>

          <View
            id="price-reminder"
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <View
              id="price"
              style={{
                flex: 0.5,
                flexDirection: "row",
                backgroundColor: "#323232",
                padding: 20,
                gap: 5,
                borderRadius: 10,
                justifyContent: "space-between",
              }}
            >
              <Text
                bold
                style={{
                  fontSize: 18,
                }}
              >
                Price
              </Text>
              <Text
                bold
                style={{
                  fontSize: 18,
                  color: apidonPink,
                }}
              >
                ₺53
              </Text>
            </View>
            <View
              id="reminder"
              style={{
                flex: 0.5,
                flexDirection: "row",
                backgroundColor: "#323232",
                padding: 20,
                gap: 5,
                borderRadius: 10,
                justifyContent: "space-between",
              }}
            >
              <Text
                bold
                style={{
                  fontSize: 18,
                }}
              >
                Stock
              </Text>
              <Text
                bold
                style={{
                  fontSize: 18,
                  color: apidonPink,
                }}
              >
                4 Left
              </Text>
            </View>
          </View>

          <Pressable
            style={{
              backgroundColor: apidonPink,
              padding: 20,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              bold
              style={{
                color: "white",
                fontSize: 18,
              }}
            >
              Collect
            </Text>
          </Pressable>
        </View>
      </CustomBottomModalSheet>
    </>
  );
};

export default Post;
