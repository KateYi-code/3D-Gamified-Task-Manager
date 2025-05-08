import { getSession } from "@/endpoints/handler";
import { prisma } from "@/db";

/**
 * Add new or update a follow. Check if the user is already following the target.
 * followUser(targetId: string)
 */
export const followUser = async (targetId: string) => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");

  if (user.id === targetId) throw new Error("You cannot follow yourself");
  // Check if the user is already following the target
  return prisma.follow.upsert({
    where: {
      userId_followedId: {
        userId: user.id,
        followedId: targetId,
      },
    },
    create: {
      userId: user.id,
      followedId: targetId,
    },
    update: {},
  });
};

/**
 * Unfollow a user
 * unfollowUser(targetId: string)
 */
export const unfollowUser = async (targetId: string) => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");

  if (user.id === targetId) throw new Error("You cannot unfollow yourself");
  // Check if the user is already following the target
  return prisma.follow.delete({
    where: {
      userId_followedId: {
        userId: user.id,
        followedId: targetId,
      },
    },
  });
}

/**
 * Get my followings
 * getMyFollowings()
 */
export const getMyFollowings = async () => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");
  return prisma.follow
    .findMany({
      where: { userId: user.id },
      include: {
        followed: true,
      },
    })
    .then((f) => f.map((f) => f.followed));
}

/**
 * Get my followers
 * getMyFollowers()
 */
export const getMyFollowers = async () => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");
  return prisma.follow
    .findMany({
      where: { followedId: user.id },
      include: {
        user: true,
      },
    })
    .then((f) => f.map((f) => f.user));
}

/**
 * Remove a user from my followings
 * removeMyFollowing(targetId: string)
 */
export const removeMyFollowing = async (targetId: string) => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");

  if (user.id === targetId) throw new Error("You cannot remove yourself");
  // Check if the user is already following the target
  return prisma.follow.delete({
    where: {
      userId_followedId: {
        userId: user.id,
        followedId: targetId,
      },
    },
  });
}

/**
 * Get followings number
 * getFollowingsNumber(targetId: string)
 */
export const getFollowingsNumber = async (targetId: string) => {
  return prisma.follow.count({
    where: {
      followedId: targetId,
    },
  });
}
/**
 * Get followers number
 * getFollowersNumber(targetId: string)
 */
export const getFollowersNumber = async (targetId: string) => {
  return prisma.follow.count({
    where: {
      userId: targetId,
    },
  });
}
/**
 * Check if the user is following the target
 * isFollowing(targetId: string)
 */
export const isFollowing = async (targetId: string) => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");

  if (user.id === targetId) throw new Error("You cannot check yourself");
  // Check if the user is already following the target
  const followedUser = await prisma.follow.findFirst({
    where: {
      userId: user.id,
      followedId: targetId,
    },
  })
  return !!followedUser;
}
/**
 * Get my followings number
 * getMyFollowingsNumber()
 */
export const getMyFollowingsNumber = async () => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");
  return prisma.follow.count({
    where: {
      userId: user.id,
    },
  });
}
/**
 * Get my followers number
 * getMyFollowersNumber()
 */
export const getMyFollowersNumber = async () => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");
  return prisma.follow.count({
    where: {
      followedId: user.id,
    },
  });
}

export const getProfile = async (userId: string) => {
  // no necessarily need to be logged in.
  // const user = getSession().user;
  // if (!user) {
  //   throw new Error("login required");
  // }
  // get profile page by userID, include followers, following, name, email, all_post_likes
  const [profile, followersCount, followingCount, totalLikes] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),

    prisma.follow.count({
      where: { followedId: userId },
    }),

    prisma.follow.count({
      where: { userId: userId },
    }),

    prisma.postLike.count({
      where: {
        post: {
          userId: userId,
        },
      },
    }),
  ])
  if (!profile) {
    throw new Error("User not found")
  }
  return {
    ...profile,
    followersCount,
    followingCount,
    totalLikes,
  }
}
