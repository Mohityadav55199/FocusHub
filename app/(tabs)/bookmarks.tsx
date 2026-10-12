import { Loader } from "@/components/Loader";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/feed.styles";
import { styles as profileStyles } from "@/styles/profile.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { Image } from "expo-image";
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";

export default function Bookmarks() {
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);
  const bookmarkedPosts = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarkedPosts === undefined) return <Loader />;
  if (bookmarkedPosts.length === 0) return <NoBookmarksFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {/* POSTS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 8,
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        {bookmarkedPosts.map((post) => {
          if (!post) return null;
          return (
            <TouchableOpacity
              key={post._id}
              style={{ width: "33.33%", padding: 1 }}
              onPress={() => setSelectedPost(post)}
              activeOpacity={0.8}
            >
              <Image
                source={post.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* PHOTO DETAIL MODAL */}
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <TouchableOpacity
          style={profileStyles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSelectedPost(null)}
        >
          {selectedPost && (
            <View
              style={profileStyles.postDetailContainer}
              onStartShouldSetResponder={() => true}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <View style={[profileStyles.postDetailHeader, { justifyContent: "space-between" }]}>
                <Text style={{ color: COLORS.white, fontWeight: "600", fontSize: 16 }}>
                  Saved Post
                </Text>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
              </View>

              <Image
                source={selectedPost.imageUrl}
                cachePolicy={"memory-disk"}
                style={profileStyles.postDetailImage}
                contentFit="cover"
              />

              {selectedPost.caption && (
                <View style={{ padding: 14 }}>
                  <Text style={{ color: COLORS.white, fontSize: 14 }}>{selectedPost.caption}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

function NoBookmarksFound() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
        padding: 24,
        gap: 12,
      }}
    >
      <Ionicons name="bookmark-outline" size={56} color={COLORS.primary} />
      <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: "600" }}>No bookmarks yet</Text>
      <Text style={{ color: COLORS.grey, fontSize: 14, textAlign: "center" }}>
        Save posts you like by tapping the bookmark icon on any post in your feed.
      </Text>
    </View>
  );
}
