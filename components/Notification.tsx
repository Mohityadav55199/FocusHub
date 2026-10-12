import { COLORS } from "@/constants/theme";
import { styles } from "@/styles/notifications.styles";
import { styles as profileStyles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View, Modal } from "react-native";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";

export default function Notification({ notification }: any) {
  const router = useRouter();
  const [showPostModal, setShowPostModal] = useState(false);

  const handleNavigateToUser = () => {
    if (notification.sender?._id) {
      router.push(`/user/${notification.sender._id}`);
    }
  };

  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={handleNavigateToUser}
          activeOpacity={0.8}
        >
          <Image
            source={notification.sender?.image || DEFAULT_AVATAR}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
          <View style={styles.iconBadge}>
            {notification.type === "like" ? (
              <Ionicons name="heart" size={14} color={COLORS.primary} />
            ) : notification.type === "follow" ? (
              <Ionicons name="person-add" size={14} color="#8B5CF6" />
            ) : (
              <Ionicons name="chatbubble" size={14} color="#3B82F6" />
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.notificationInfo}>
          <TouchableOpacity onPress={handleNavigateToUser} activeOpacity={0.7}>
            <Text style={styles.username}>{notification.sender?.username || "user"}</Text>
          </TouchableOpacity>

          <Text style={styles.action}>
            {notification.type === "follow"
              ? "started following you"
              : notification.type === "like"
              ? "liked your post"
              : `commented: "${notification.comment || ""}"`}
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(notification._creationTime, { addSuffix: true })}
          </Text>
        </View>
      </View>

      {notification.post && (
        <TouchableOpacity onPress={() => setShowPostModal(true)} activeOpacity={0.8}>
          <Image
            source={notification.post.imageUrl}
            style={styles.postImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
          />
        </TouchableOpacity>
      )}

      {/* POST PREVIEW MODAL */}
      {notification.post && (
        <Modal
          visible={showPostModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowPostModal(false)}
        >
          <TouchableOpacity
            style={profileStyles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowPostModal(false)}
          >
            <View
              style={profileStyles.postDetailContainer}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <View style={[profileStyles.postDetailHeader, { justifyContent: "space-between" }]}>
                <Text style={{ color: COLORS.white, fontWeight: "600", fontSize: 16 }}>
                  Post
                </Text>
                <TouchableOpacity onPress={() => setShowPostModal(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Image
                source={notification.post.imageUrl}
                cachePolicy={"memory-disk"}
                style={profileStyles.postDetailImage}
                contentFit="cover"
              />

              {notification.post.caption && (
                <View style={{ padding: 14 }}>
                  <Text style={{ color: COLORS.white, fontSize: 14 }}>
                    {notification.post.caption}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
