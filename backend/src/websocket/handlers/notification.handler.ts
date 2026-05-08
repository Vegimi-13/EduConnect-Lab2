import { Server, Socket } from "socket.io";

let notificationIo: Server | null = null;

export const notificationHandler = (io: Server, socket: Socket) => {
  notificationIo = io;

  const user_id = socket.data.user_id;
  const room = getNotificationRoom(user_id);

  socket.join(room);
  console.log(`User ${user_id} joined notification room`);

  socket.on("join_notifications", () => {
    socket.join(room);
    socket.emit("notifications_joined", { user_id });
  });

  socket.on("leave_notifications", () => {
    socket.leave(room);
    socket.emit("notifications_left", { user_id });
  });

  socket.on("disconnect", () => {
    console.log(`User ${user_id} disconnected from notifications`);
  });
};

export const emitNotificationCreated = (userId: number, notification: unknown) => {
  notificationIo
    ?.to(getNotificationRoom(userId))
    .emit("notification_created", notification);
};

export const emitNotificationRead = (userId: number, notification: unknown) => {
  notificationIo
    ?.to(getNotificationRoom(userId))
    .emit("notification_read", notification);
};

export const emitAllNotificationsRead = (userId: number, result: unknown) => {
  notificationIo
    ?.to(getNotificationRoom(userId))
    .emit("notifications_read_all", result);
};

export const emitNotificationDeleted = (userId: number, notificationId: number) => {
  notificationIo
    ?.to(getNotificationRoom(userId))
    .emit("notification_deleted", { id: notificationId });
};

function getNotificationRoom(userId: number) {
  return `notifications:${userId}`;
}
