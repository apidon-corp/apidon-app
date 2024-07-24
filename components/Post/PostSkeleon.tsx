import React from "react";
import { View, StyleSheet } from "react-native";

const PostSkeleton = () => {
  return (
    <View style={styles.postRoot}>
      <View style={styles.header}>
        <View style={styles.senderInformation}>
          <View style={styles.profilePhotoSkeleton} />
          <View style={styles.usernameFullnameTime}>
            <View style={styles.usernameFullname}>
              <View style={styles.usernameSkeleton} />
              <View style={styles.fullnameTimeContainer}>
                <View style={styles.fullnameSkeleton} />
              </View>
            </View>
          </View>
        </View>
        <View style={styles.nftTagSkeleton} />
      </View>
      <View style={styles.imageSkeleton} />
      <View style={styles.footer}>
        <View style={styles.commentsPreview}>
          <View style={styles.descriptionSkeleton} />
          <View style={styles.commentCountSkeleton} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  postRoot: {
    width: "100%",
    padding: 10,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  senderInformation: {
    width: "55%",
    flexDirection: "row",
    alignItems: "center",
  },
  profilePhotoSkeleton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
  },
  usernameFullnameTime: {
    marginLeft: 10,
    flexDirection: "column",
    justifyContent: "center",
  },
  usernameFullname: {
    marginBottom: 6,
  },
  usernameSkeleton: {
    width: 80,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginBottom: 6,
  },
  fullnameTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  fullnameSkeleton: {
    width: 120,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  dotSkeleton: {
    width: 5,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 5,
  },
  timeSkeleton: {
    width: 50,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  nftTagSkeleton: {
    width: "30%",
    height: 20,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  settingsButtonSkeleton: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  imageSkeleton: {
    width: "100%",
    height: 350,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  footer: {
    width: "100%",
    marginTop: 10,
  },
  starsStarShare: {
    width: "100%",
    height: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  starSkeleton: {
    width: "30%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  rateStarSkeleton: {
    width: "30%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  shareSkeleton: {
    width: "30%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
  commentsPreview: {
    marginTop: 10,
  },
  descriptionSkeleton: {
    width: "100%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
    marginBottom: 6,
  },
  commentCountSkeleton: {
    width: "60%",
    height: 12,
    borderRadius: 4,
    backgroundColor: "#e0e0e0",
  },
});

export default PostSkeleton;
