import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Jangan gunakan edge runtime untuk Next-Auth
// export const runtime = 'edge'

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };