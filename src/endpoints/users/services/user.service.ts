import { prisma } from "@/db";
import bcrypt from "bcrypt";
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
