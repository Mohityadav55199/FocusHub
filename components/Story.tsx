import { styles } from "@/styles/feed.styles";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type Story = {
  id: string;
  username: string;
  avatar: string;
  hasStory: boolean;
};

export default function Story({ story }: { story: Story }) {
  const router = useRouter();
  const isCurrentUser = story.username.toLowerCase() === "you";
  const user = useQuery(
    api.users.getUserByUsername,
    !isCurrentUser ? { username: story.username } : "skip"
  );

  const handlePress = () => {
    if (isCurrentUser) {
      router.push("/(tabs)/profile");
    } else if (user?._id) {
      router.push(`/user/${user._id}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.storyWrapper}
      onPress={handlePress}
      activeOpacity={0.75}
    >
      <View style={[styles.storyRing, !story.hasStory && styles.noStory]}>
        <Image source={{ uri: story.avatar }} style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyUsername} numberOfLines={1}>
        {story.username}
      </Text>
    </TouchableOpacity>
  );
}
