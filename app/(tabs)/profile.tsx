import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/profile.styles";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import { Image } from "expo-image";
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";

export default function Profile() {
  const { signOut, userId } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAvatarModalVisible, setIsAvatarModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentUser = useQuery(api.users.getUserByClerkId, userId ? { clerkId: userId } : "skip");

  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";

  const [editedProfile, setEditedProfile] = useState({
    fullname: "",
    bio: "",
  });

  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const posts = useQuery(api.posts.getPostsByUser, {});

  const updateProfile = useMutation(api.users.updateProfile);

  const handleOpenEditModal = () => {
    if (currentUser) {
      setEditedProfile({
        fullname: currentUser.fullname || "",
        bio: currentUser.bio || "",
      });
    }
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile.fullname.trim()) return;
    try {
      setIsSaving(true);
      await updateProfile({
        fullname: editedProfile.fullname.trim(),
        bio: editedProfile.bio.trim() || undefined,
      });
      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser || posts === undefined) return <Loader />;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.username}>{currentUser.username}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon} onPress={() => signOut()}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          {/* AVATAR & STATS */}
          <View style={styles.avatarAndStats}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => setIsAvatarModalVisible(true)}
              activeOpacity={0.8}
            >
              <Image
                source={currentUser.image || defaultAvatar}
                style={styles.avatar}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.posts}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{currentUser.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{currentUser.fullname}</Text>
          {currentUser.bio && <Text style={styles.bio}>{currentUser.bio}</Text>}

          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} onPress={handleOpenEditModal}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {posts.length === 0 && <NoPostsFound />}

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
              />
            </TouchableOpacity>
          )}
        />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setIsEditModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editedProfile.fullname}
                onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, fullname: text }))}
                placeholder="Your full name"
                placeholderTextColor={COLORS.grey}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={editedProfile.bio}
                onChangeText={(text) => setEditedProfile((prev) => ({ ...prev, bio: text }))}
                placeholder="Tell us about yourself"
                placeholderTextColor={COLORS.grey}
                multiline
                numberOfLines={4}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSaving && { opacity: 0.7 }]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SELECTED IMAGE MODAL */}
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
                cachePolicy={"memory-disk"}
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
                {currentUser.fullname || currentUser.username}
              </Text>
              <TouchableOpacity onPress={() => setIsAvatarModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Image
              source={currentUser.image || defaultAvatar}
              cachePolicy="memory-disk"
              style={styles.postDetailImage}
              contentFit="cover"
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function NoPostsFound() {
  return (
    <View
      style={{
        height: "100%",
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name="images-outline" size={48} color={COLORS.primary} />
      <Text style={{ fontSize: 20, color: COLORS.white }}>No posts yet</Text>
    </View>
  );
}
