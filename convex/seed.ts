import { mutation } from "./_generated/server";

export const seedSampleData = mutation({
  handler: async (ctx) => {
    // Check if sample posts already exist
    const existingPosts = await ctx.db.query("posts").collect();
    if (existingPosts.length > 0) {
      return { message: "Posts already exist. Skipping seed.", count: existingPosts.length };
    }

    // 1. Seed Users
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
        clerkId: "seed_user_sarah",
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
        clerkId: "seed_user_alex",
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
        clerkId: "seed_user_julia",
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
        clerkId: "seed_user_mike",
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
        clerkId: "seed_user_claudia",
      },
    ];

    const userIds: Record<string, any> = {};

    for (const user of sampleUsers) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", user.clerkId))
        .first();

      if (existing) {
        userIds[user.username] = existing._id;
      } else {
        const id = await ctx.db.insert("users", user);
        userIds[user.username] = id;
      }
    }

    // 2. Seed Posts
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
    for (const post of samplePosts) {
      const authorId = userIds[post.username];
      if (authorId) {
        const postId = await ctx.db.insert("posts", {
          userId: authorId,
          imageUrl: post.imageUrl,
          caption: post.caption,
          likes: post.likes,
          comments: post.comments,
        });
        postIds.push({ postId, authorId });
      }
    }

    // 3. Seed Sample Comments
    const sampleComments = [
      "This view is absolutely breathtaking! 😍",
      "Clean composition, love the tones in this shot ✨",
      "Adding this to my bucket list immediately! ✈️",
      "The aesthetic is unreal! What camera do you shoot with?",
    ];

    for (let i = 0; i < postIds.length; i++) {
      const { postId, authorId } = postIds[i];
      // Pick a couple of commenters who are not the author
      const commenters = Object.values(userIds).filter((id) => id !== authorId);
      for (let j = 0; j < Math.min(commenters.length, 2); j++) {
        await ctx.db.insert("comments", {
          postId,
          userId: commenters[j],
          content: sampleComments[(i + j) % sampleComments.length],
        });
      }
    }

    return { message: "Successfully seeded sample profiles and posts!", postsCreated: postIds.length };
  },
});
