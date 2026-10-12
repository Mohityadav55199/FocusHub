import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Pressable, FlatList, Modal, Platform } from "react-native";
import { Doc } from "@/convex/_generated/dataModel";

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";

  const profile = useQuery(api.users.getUserProfile, id ? { id: id as Id<"users"> } : "skip");
  const posts = useQuery(api.posts.getPostsByUser, id ? { userId: id as Id<"users"> } : "skip");
  const isFollowing = useQuery(api.users.isFollowing, id ? { followingId: id as Id<"users"> } : "skip");

  const toggleFollow = useMutation(api.users.toggleFollow);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)");
  };

  if (profile === undefined || posts === undefined || isFollowing === undefined) return <Loader />;

  if (!profile) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Ionicons name="person-outline" size={48} color={COLORS.grey} />
        <Text style={{ color: COLORS.white, fontSize: 18, marginVertical: 12 }}>User not found</Text>
        <TouchableOpacity style={styles.followButton} onPress={handleBack}>
          <Text style={styles.followButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={Platform.OS === "web" ? { flex: 1, maxWidth: 480, width: "100%", alignSelf: "center" } : { flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{profile.username}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileInfo}>
            <View style={styles.avatarAndStats}>
              {/* AVATAR */}
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={() => setIsAvatarModalVisible(true)}
                activeOpacity={0.8}
              >
                <Image
                  source={profile.image || defaultAvatar}
                  style={styles.avatar}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>

              {/* STATS */}
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.posts}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.following}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>

            <Text style={styles.name}>{profile.fullname}</Text>
            {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

            <Pressable
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
            >
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? "Following" : "Follow"}
              </Text>
            </Pressable>
          </View>

          <View style={styles.postsGrid}>
            {posts.length === 0 ? (
              <View style={styles.noPostsContainer}>
                <Ionicons name="images-outline" size={48} color={COLORS.grey} />
                <Text style={styles.noPostsText}>No posts yet</Text>
              </View>
            ) : (
              <FlatList
                data={posts}
                numColumns={3}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.gridItem} onPress={() => setSelectedPost(item)}>
                    <Image
                      source={item.imageUrl}
                      style={styles.gridImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item._id}
              />
            )}
          </View>
        </ScrollView>

        {/* PHOTO DETAIL MODAL */}
        <Modal
          visible={!!selectedPost}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setSelectedPost(null)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSelectedPost(null)}
          >
            {selectedPost && (
              <View
                style={styles.postDetailContainer}
                onStartShouldSetResponder={() => true}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <View style={[styles.postDetailHeader, { justifyContent: "flex-end" }]}>
                  <TouchableOpacity onPress={() => setSelectedPost(null)}>
                    <Ionicons name="close" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
                <Image
                  source={selectedPost.imageUrl}
                  cachePolicy="memory-disk"
                  style={styles.postDetailImage}
                  contentFit="cover"
                />
              </View>
            )}
          </TouchableOpacity>
        </Modal>

        {/* AVATAR FULL VIEW MODAL */}
        <Modal
          visible={isAvatarModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsAvatarModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setIsAvatarModalVisible(false)}
          >
            <View
              style={styles.postDetailContainer}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <View style={styles.postDetailHeader}>
                <Text style={{ color: COLORS.white, fontWeight: "600", fontSize: 16 }}>
                  {profile.fullname || profile.username}
                </Text>
                <TouchableOpacity onPress={() => setIsAvatarModalVisible(false)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <Image
                source={profile.image || defaultAvatar}
                cachePolicy="memory-disk"
                style={styles.postDetailImage}
                contentFit="cover"
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
}
