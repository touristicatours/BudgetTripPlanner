import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/trips/:path*",
    "/plan",
    "/api/trips/:path*",
    "/api/polls/:path*",
    "/api/receipts/:path*",
  ],
};
