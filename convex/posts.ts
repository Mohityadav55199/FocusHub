import { getNotifications } from "./notifications";
import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },

  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image not found");

    // create post
    const postId = await ctx.db.insert("posts", {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // increment user's post count by 1
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const getFeedPosts = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return [];

    // get all posts
    const posts = await ctx.db.query("posts").order("desc").collect();
    if (posts.length === 0) return [];

    // enhance posts with userdata and interaction status
    const postsWithInfo = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = await ctx.db.get(post.userId);
        if (!postAuthor) return null;

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", currentUser._id).eq("postId", post._id)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postAuthor._id,
            username: postAuthor.username,
            image: postAuthor.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );

    return postsWithInfo.filter((p): p is NonNullable<typeof p> => p !== null);
  },
});

export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", currentUser._id).eq("postId", args.postId)
      )
      .first();

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      // remove like
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false; // unliked
    } else {
      // add like
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      // if it's not my post create a notification
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: args.postId,
        });
      }
      return true; // liked
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    // verify ownership
    if (post.userId !== currentUser._id) throw new Error("Not authorized to delete this post");

    // delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // delete associated bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // delete the storage file if present
    if (post.storageId) {
      await ctx.storage.delete(post.storageId);
    }

    // delete the post
    await ctx.db.delete(args.postId);

    // decrement user's post count by 1
    await ctx.db.patch(currentUser._id, {
      posts: Math.max(0, (currentUser.posts || 1) - 1),
    });
  },
});

export const getPostsByUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = args.userId ? await ctx.db.get(args.userId) : await getAuthenticatedUser(ctx);

    if (!user) throw new Error("User not found");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) => q.eq("userId", args.userId || user._id))
      .collect();

    return posts;
  },
});

export const seedSampleData = mutation({
  handler: async (ctx) => {
    const existingSeedUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", "seed_sarah"))
      .first();

    if (existingSeedUser) {
      return { message: "Sample posts and profiles already seeded" };
    }

    const sampleUsers = [
      {
        username: "sarah.k",
        fullname: "Sarah Jenkins",
        email: "sarah@example.com",
        bio: "Visual storyteller & travel photographer 📸 Capturing moments worldwide ✈️",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop",
        followers: 1240,
        following: 382,
        posts: 2,
        clerkId: "seed_sarah",
      },
      {
        username: "alex.m",
        fullname: "Alex Morgan",
        email: "alex@example.com",
        bio: "Product Designer & UI/UX enthusiast 🎨 Building thoughtful digital experiences",
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&h=500&fit=crop",
        followers: 890,
        following: 215,
        posts: 1,
        clerkId: "seed_alex",
      },
      {
        username: "julia.r",
        fullname: "Julia Rivera",
        email: "julia@example.com",
        bio: "Nature lover & mountain hiker 🏔️ Living life one adventure at a time 🌲",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&h=500&fit=crop",
        followers: 2310,
        following: 430,
        posts: 1,
        clerkId: "seed_julia",
      },
      {
        username: "mike.rs",
        fullname: "Mike Ross",
        email: "mike@example.com",
        bio: "Urban architecture & street photography 🏙️ Finding beauty in geometry",
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500&h=500&fit=crop",
        followers: 640,
        following: 190,
        posts: 1,
        clerkId: "seed_mike",
      },
      {
        username: "claudia",
        fullname: "Claudia Chen",
        email: "claudia@example.com",
        bio: "Creative director & matcha lover 🍵 Aesthetic spaces, art & slow living ✨",
        image: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=500&h=500&fit=crop",
        followers: 1540,
        following: 312,
        posts: 1,
        clerkId: "seed_claudia",
      },
    ];

    const userIds: Record<string, any> = {};
    for (const u of sampleUsers) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", u.clerkId))
        .first();

      if (existing) {
        userIds[u.username] = existing._id;
      } else {
        const id = await ctx.db.insert("users", u);
        userIds[u.username] = id;
      }
    }

    const samplePosts = [
      {
        username: "sarah.k",
        imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1080&h=1080&fit=crop",
        caption: "Chasing waterfalls in Yosemite. Nothing beats the sound of rushing water and pure alpine air 🌲✨ #nature #wanderlust",
        likes: 342,
        comments: 4,
      },
      {
        username: "alex.m",
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1080&h=1080&fit=crop",
        caption: "Current desk setup for deep work sprints. Minimalist workspace keeps the focus sharp 💻⚡️",
        likes: 189,
        comments: 3,
      },
      {
        username: "julia.r",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1080&h=1080&fit=crop",
        caption: "Golden hour in the Swiss Alps. Standing above the clouds reminds you how big the world is ⛰️🌅",
        likes: 521,
        comments: 3,
      },
      {
        username: "mike.rs",
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&h=1080&fit=crop",
        caption: "Reflections on glass & steel. Architecture speaks when the light hits right 🏢📐",
        likes: 112,
        comments: 2,
      },
      {
        username: "claudia",
        imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1080&h=1080&fit=crop",
        caption: "Sunday brunch atmosphere in Soho. Great coffee, cozy corners, and good conversations ☕️🥖",
        likes: 278,
        comments: 3,
      },
      {
        username: "sarah.k",
        imageUrl: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&h=1080&fit=crop",
        caption: "Downtown skyline bathed in evening lights. City energy never stops 🏙️🌃",
        likes: 410,
        comments: 2,
      },
    ];

    const postIds: any[] = [];
    for (const p of samplePosts) {
      const authorId = userIds[p.username];
      if (authorId) {
        const postId = await ctx.db.insert("posts", {
          userId: authorId,
          imageUrl: p.imageUrl,
          caption: p.caption,
          likes: p.likes,
          comments: p.comments,
        });
        postIds.push({ postId, authorId });
      }
    }

    const commentsList = [
      "This view is absolutely breathtaking! 😍",
      "Clean composition, love the tones in this shot ✨",
      "Adding this to my bucket list immediately! ✈️",
      "The aesthetic is unreal! What camera do you shoot with?",
    ];

    for (let i = 0; i < postIds.length; i++) {
      const { postId, authorId } = postIds[i];
      const commenters = Object.values(userIds).filter((id) => id !== authorId);
      for (let j = 0; j < Math.min(commenters.length, 2); j++) {
        await ctx.db.insert("comments", {
          postId,
          userId: commenters[j],
          content: commentsList[(i + j) % commentsList.length],
        });
      }
    }

    return { message: "Seeded successfully", count: postIds.length };
  },
});
