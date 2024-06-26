export type NotificationData = {
  cause: "like" | "follow" | "comment" | "frenlet";
  postDocPath?: string;
  sender: string;
  ts: number;
};

export type NotificationDocData = {
  notifications: NotificationData[];
  lastOpenedTime: number;
};
