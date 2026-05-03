import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Naver from "next-auth/providers/naver";
import Kakao from "next-auth/providers/kakao";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Naver({
      clientId: process.env.NAVER_CLIENT_ID!,
      clientSecret: process.env.NAVER_CLIENT_SECRET!,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.provider = account.provider;
      }
      if (profile && "id" in profile) {
        token.providerId = String(profile.id);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { provider?: string }).provider = token.provider as string | undefined;
        (session.user as { providerId?: string }).providerId = token.providerId as string | undefined;
      }
      return session;
    },
  },
});
