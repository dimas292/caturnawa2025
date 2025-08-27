// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    
    console.log("Middleware:", {
      pathname: req.nextUrl.pathname,
      isAuth,
      role: token?.role,
      isAuthPage
    })
    
    // If user is on auth page and already authenticated, redirect to dashboard
    if (isAuthPage && isAuth) {
      console.log("Redirecting from auth page, role:", token?.role)
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", req.url))
      } else if (token?.role === "judge") {
        return NextResponse.redirect(new URL("/dashboard/judge", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // If user is trying to access protected routes without auth
    if (!isAuth && !isAuthPage && req.nextUrl.pathname !== "/") {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Role-based access control
    if (isAuth && token) {
      const { pathname } = req.nextUrl
      const role = token.role as string

      // Admin routes - only admin can access
      if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }

      // Judge routes - only judge can access
      if (pathname.startsWith("/dashboard/judge") && role !== "judge") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }

      // Participant routes - only participant can access
      if (pathname.startsWith("/dashboard/participant") && role !== "participant") {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }

      // General dashboard - all authenticated users can access
      if (pathname === "/dashboard" && !pathname.startsWith("/dashboard/admin") && !pathname.startsWith("/dashboard/judge") && !pathname.startsWith("/dashboard/participant")) {
        // Allow access to general dashboard
        return
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        console.log("Auth callback:", { pathname, hasToken: !!token, role: token?.role })
        
        // Public routes that don't require authentication
        const publicRoutes = ["/", "/results", "/competitions"]
        if (publicRoutes.includes(pathname)) {
          return true
        }

        // Auth pages
        if (pathname.startsWith("/auth")) {
          return true
        }

        // All other routes require authentication
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
}