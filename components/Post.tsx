import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { styles as profileStyles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import CommentsModal from "./CommentsModal";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/clerk-expo";

type PostProps = {
  post: {
    _id: Id<"posts">;
    imageUrl: string;
    caption?: string;
    likes: number;
    comments: number;
    _creationTime: number;
    isLiked: boolean;
    isBookmarked: boolean;
    author: {
      _id: string;
      username: string;
      image: string;
    };
  };
};

export default function Post({ post }: PostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [showComments, setShowComments] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";

  const router = useRouter();
  const { user } = useUser();

  const currentUser = useQuery(api.users.getUserByClerkId, user ? { clerkId: user.id } : "skip");

  const toggleLike = useMutation(api.posts.toggleLike);
  const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);
  const deletePost = useMutation(api.posts.deletePost);

  const handleLike = async () => {
    try {
      const newIsLiked = await toggleLike({ postId: post._id });
      setIsLiked(newIsLiked);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleBookmark = async () => {
    const newIsBookmarked = await toggleBookmark({ postId: post._id });
    setIsBookmarked(newIsBookmarked);
  };

  const handleDelete = async () => {
    try {
      await deletePost({ postId: post._id });
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const navigateToProfile = () => {
    if (currentUser?._id === post.author._id) {
      router.push("/(tabs)/profile");
    } else {
      router.push(`/user/${post.author._id}`);
    }
  };

  return (
    <View style={styles.post}>
      {/* POST HEADER */}
      <View style={styles.postHeader}>
        <View style={styles.postHeaderLeft}>
          <TouchableOpacity
            onPress={() => setIsAvatarModalVisible(true)}
            activeOpacity={0.8}
          >
            <Image
              source={post.author.image || defaultAvatar}
              style={styles.postAvatar}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToProfile} activeOpacity={0.7}>
            <Text style={styles.postUsername}>{post.author.username}</Text>
          </TouchableOpacity>
        </View>

        {/* if i'm the owner of the post, show the delete button  */}
        {post.author._id === currentUser?._id ? (
          <TouchableOpacity onPress={handleDelete}>
            <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {/* IMAGE */}
      <Image
        source={post.imageUrl}
        style={styles.postImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />

      {/* POST ACTIONS */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Ionicons name="chatbubble-outline" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleBookmark}>
          <Ionicons
            name={isBookmarked ? "bookmark" : "bookmark-outline"}
            size={22}
            color={COLORS.white}
          />
        </TouchableOpacity>
      </View>

      {/* POST INFO */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes > 0 ? `${post.likes.toLocaleString()} likes` : "Be the first to like"}
        </Text>
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.captionUsername}>{post.author.username}</Text>
            <Text style={styles.captionText}>{post.caption}</Text>
          </View>
        )}

        {post.comments > 0 && (
          <TouchableOpacity onPress={() => setShowComments(true)}>
            <Text style={styles.commentsText}>View all {post.comments} comments</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.timeAgo}>
          {formatDistanceToNow(post._creationTime, { addSuffix: true })}
        </Text>
      </View>

      <CommentsModal
        postId={post._id}
        visible={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* AVATAR FULL VIEW MODAL */}
      <Modal
        visible={isAvatarModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsAvatarModalVisible(false)}
      >
        <TouchableOpacity
          style={profileStyles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setIsAvatarModalVisible(false)}
        >
          <View
            style={profileStyles.postDetailContainer}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={profileStyles.postDetailHeader}>
              <TouchableOpacity
                onPress={() => {
                  setIsAvatarModalVisible(false);
                  navigateToProfile();
                }}
              >
                <Text style={{ color: COLORS.primary, fontWeight: "600", fontSize: 16 }}>
                  @{post.author.username}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsAvatarModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Image
              source={post.author.image || defaultAvatar}
              cachePolicy="memory-disk"
              style={profileStyles.postDetailImage}
              contentFit="cover"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
