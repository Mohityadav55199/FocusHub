import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    image: v.string(),
    bio: v.optional(v.string()),
    email: v.string(),
    clerkId: v.string(),
  },

  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existingUser) return;

    // create a user in db
    await ctx.db.insert("users", {
      username: args.username,
      fullname: args.fullname,
      email: args.email,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      followers: 0,
      following: 0,
      posts: 0,
    });
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    return user;
  },
});

export const getUserByUsername = query({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("username"), args.username))
      .first();

    return user;
  },
});

export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const updateFields: any = {
      fullname: args.fullname,
      bio: args.bio,
    };
    if (args.image) {
      updateFields.image = args.image;
    }

    await ctx.db.patch(currentUser._id, updateFields);
  },
});

export const ensureUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop";

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (existingUser) {
      if (!existingUser.image) {
        const fallback = (identity as any).pictureUrl || defaultAvatar;
        await ctx.db.patch(existingUser._id, { image: fallback });
      }
      return existingUser;
    }

    const email = identity.email || "";
    const fullname = identity.name || (email ? email.split("@")[0] : "User");
    const username =
      (identity as any).nickname ||
      (identity as any).preferredUsername ||
      (email ? email.split("@")[0] : "user");
    const image = (identity as any).pictureUrl || defaultAvatar;

    const newUserId = await ctx.db.insert("users", {
      username,
      fullname,
      email,
      image,
      clerkId: identity.subject,
      followers: 0,
      following: 0,
      posts: 0,
    });

    return await ctx.db.get(newUserId);
  },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  let currentUser = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  if (!currentUser) {
    if ("insert" in ctx.db) {
      const email = identity.email || "";
      const fullname = identity.name || (email ? email.split("@")[0] : "User");
      const username =
        (identity as any).nickname ||
        (identity as any).preferredUsername ||
        (email ? email.split("@")[0] : "user");
      const image = (identity as any).pictureUrl || "";

      const newUserId = await (ctx as MutationCtx).db.insert("users", {
        username,
        fullname,
        email,
        image,
        clerkId: identity.subject,
        followers: 0,
        following: 0,
        posts: 0,
      });
      currentUser = await ctx.db.get(newUserId);
    }
  }

  if (!currentUser) throw new Error("User not found");

  return currentUser;
}

export const getUserProfile = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db.get(args.id);
      return user;
    } catch {
      return null;
    }
  },
});

export const isFollowing = query({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return false;

    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!currentUser) return false;

    const follow = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    return !!follow;
  },
});

export const toggleFollow = mutation({
  args: { followingId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("follows")
      .withIndex("by_both", (q) =>
        q.eq("followerId", currentUser._id).eq("followingId", args.followingId)
      )
      .first();

    if (existing) {
      // unfollow
      await ctx.db.delete(existing._id);
      await updateFollowCounts(ctx, currentUser._id, args.followingId, false);
    } else {
      // follow
      await ctx.db.insert("follows", {
        followerId: currentUser._id,
        followingId: args.followingId,
      });
      await updateFollowCounts(ctx, currentUser._id, args.followingId, true);

      // create a notification
      await ctx.db.insert("notifications", {
        receiverId: args.followingId,
        senderId: currentUser._id,
        type: "follow",
      });
    }
  },
});

async function updateFollowCounts(
  ctx: MutationCtx,
  followerId: Id<"users">,
  followingId: Id<"users">,
  isFollow: boolean
) {
  const follower = await ctx.db.get(followerId);
  const following = await ctx.db.get(followingId);

  if (follower && following) {
    await ctx.db.patch(followerId, {
      following: follower.following + (isFollow ? 1 : -1),
    });
    await ctx.db.patch(followingId, {
      followers: following.followers + (isFollow ? 1 : -1),
    });
  }
}
