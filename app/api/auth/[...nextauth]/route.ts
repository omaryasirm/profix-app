import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/prisma/client";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    signIn: async ({ user }) => {
      const userFound = await prisma.auth.findFirst({
        where: {
          email: user.email!,
        },
      });
      // user.hasOwnProperty("emailVerified")
      if (userFound) {
        return true;
      } else {
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
