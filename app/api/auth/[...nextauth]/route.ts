// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "../../../lib/prisma"; // 👈 Fixed path!
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Cat Tower Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "kitty@example.com" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split("@")[0],
            }
          });
          return user;
        }

        if (!user.password) return null;
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        
        if (!isPasswordValid) return null;

        return user;
      }
    })
    
  ],
  pages: {
        signIn: "/signin", // 👈 Point to our new custom page
  },
  session: { strategy: "jwt" as const },
  secret: "super-secret-cat-key",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };