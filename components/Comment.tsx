import { View, Text } from "react-native";
import { Image } from "expo-image";
import { styles } from "@/styles/feed.styles";
import { formatDistanceToNow } from "date-fns";

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";

interface Comment {
  content: string;
  _creationTime: number;
  user: {
    fullname: string;
    image: string;
  };
}

export default function Comment({ comment }: { comment: Comment }) {
  return (
    <View style={styles.commentContainer}>
      <Image
        source={comment.user.image || DEFAULT_AVATAR}
        style={styles.commentAvatar}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.commentContent}>
        <Text style={styles.commentUsername}>{comment.user.fullname || "User"}</Text>
        <Text style={styles.commentText}>{comment.content}</Text>
        <Text style={styles.commentTime}>
          {formatDistanceToNow(comment._creationTime, { addSuffix: true })}
        </Text>
      </View>
    </View>
  );
}
