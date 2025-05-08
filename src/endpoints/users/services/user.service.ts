import { prisma } from "@/db";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { getSession } from "@/endpoints/handler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const userLogout = async () => {
  const { session } = getSession();
  if (session) {
    // Delete the session from the database
    await deleteSession(session.sessionToken);
  }

  const cookie = await cookies();
  // Delete the session cookie
  cookie.delete("session");

  return {
    success: true,
  };
};

export const userRegister = async (name: string, email: string, password: string) => {
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  return await createUser(name || "", email, password);
};

export async function userLogin(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValidPassword = await validatePassword(user, password);
  if (!isValidPassword) {
    throw new Error("Invalid credentials");
  }

  // Create a session
  const session = await createSession(user.id);

  // Set the session cookie
  (await cookies()).set({
    name: "session",
    value: session.sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return user;
}

export const getUsers = async () => {
  return prisma.user.findMany({
    include: {
      sessions: true,
    },
  });
};

export const getUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

export const getUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (name: string, email: string, password?: string) => {
  const data: any = { name, email };

  if (password) {
    data.password = await bcrypt.hash(password, 10);
  }

  return prisma.user.create({ data });
};

export const getMe = async () => {
  return getSession().user;
};

export const validatePassword = async (user: { password: string | null }, password: string) => {
  if (!user.password) return false;
  return bcrypt.compare(password, user.password);
};

export const createSession = async (userId: string) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days from now

  return prisma.session.create({
    data: {
      sessionToken: randomUUID(),
      userId,
      expires,
    },
  });
};

export const getSessionByToken = async (sessionToken: string) => {
  return prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });
};

export const deleteSession = async (sessionToken: string) => {
  return prisma.session.delete({
    where: { sessionToken },
  });
};

export const addFollowing = async (followId: string) => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.follow.upsert({
    where: {
      userId_followedId: {
        userId: user.id,
        followedId: followId,
      },
    },
    create: {
      userId: user.id,
      followedId: followId,
    },
    update: {},
  });
};

export const getMyFollowings = async () => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.follow
    .findMany({
      where: { userId: user.id },
      include: {
        followed: true,
      },
    })
    .then((f) => f.map((f) => f.followed));
};

export const getMyFollowers = async () => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.follow
    .findMany({
      where: { followedId: user.id },
      include: {
        user: true,
      },
    })
    .then((f) => f.map((f) => f.user));
};

export const getMyFollowingMoments = async () => {
  const { user } = getSession();
  if (!user) {
    throw new Error("login required");
  }

  // 1) Load all the “followed” users, along with their posts
  const follows = await prisma.follow.findMany({
    where: { userId: user.id },
    include: {
      followed: {
        include: {
          posts: {
            include: {
              user: true,    // author info
              likes: true,   // who liked it
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  });
  console.log("this is my following moment", follows);
  // 2) Flatten into a single Post[]
  return follows.map((f) => ({
    user: f.followed,
    posts: f.followed.posts,
  }));
};
