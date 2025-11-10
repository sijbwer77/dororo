import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",      // 로그인 페이지
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // 로그인 성공 후 이동할 경로 지정
      return `${baseUrl}/home`;   // ← LMS 메인 페이지로 이동
    },
  },
});

export { handler as GET, handler as POST };
