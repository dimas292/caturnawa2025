// src/middleware.ts
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Public routes that don't require authentication
const publicRoutes = ["/", "/results", "/competitions", "/leaderboard"]

// Check if pathname matches any public route (including sub-paths)
const isPublicRoute = (pathname: string) => {
  return publicRoutes.some(route => {
    if (route === "/") return pathname === "/"
    return pathname === route || pathname.startsWith(route + "/")
  })
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token && !!token.id && !!token.role // More strict auth check
    const isAuthPage = req.nextUrl.pathname.startsWith("/auth")
    const pathname = req.nextUrl.pathname
    
    // Allow public routes without any auth check
    if (isPublicRoute(pathname)) {
      return NextResponse.next()
    }
    
    // If token exists but is invalid (missing id/role), clear it
    if (token && (!token.id || !token.role)) {
      return NextResponse.redirect(new URL("/auth/signin?message=session-invalid", req.url))
    }
    
    // If user is on auth page and already authenticated, redirect to dashboard
    if (isAuthPage && isAuth) {
      if (token?.role === "admin") {
        return NextResponse.redirect(new URL("/dashboard/admin", req.url))
      } else if (token?.role === "judge") {
        return NextResponse.redirect(new URL("/dashboard/judge", req.url))
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    // If user is trying to access protected routes without auth
    if (!isAuth && !isAuthPage && pathname !== "/") {
      let from = pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/auth/signin?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Role-based access control
    if (isAuth && token) {
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
      authorized: ({ req }) => {
        const { pathname } = req.nextUrl
        
        // Public routes - always allow
        if (isPublicRoute(pathname)) {
          return true
        }

        // Auth pages - always allow
        if (pathname.startsWith("/auth")) {
          return true
        }

        // All other routes will be handled by middleware function above
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - api/public (Public API routes - no auth required)
     * - api/leaderboard (Public leaderboard API)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!api/auth|api/public|api/leaderboard|_next/static|_next/image|favicon.ico|public).*)",
  ],
}