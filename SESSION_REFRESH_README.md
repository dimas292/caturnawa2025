# Session Refresh Implementation

## Overview
This implementation provides automatic session refresh functionality to prevent users from being logged out due to session expiration. Sessions are now extended to 30 days with automatic refresh every 24 hours when users are active.

## Key Features

### 1. Extended Session Duration
- **Session maxAge**: Extended from 24 hours to 30 days
- **JWT maxAge**: Extended from 24 hours to 30 days
- **Update Age**: Sessions update every 24 hours when users are active

### 2. Automatic Session Refresh
- **Background Refresh**: Sessions are automatically refreshed every 5 minutes if expiring soon
- **Smart Refresh**: Prevents excessive refresh calls (minimum 2 minutes between refreshes)
- **User Activity Tracking**: Tracks last activity to optimize refresh timing

### 3. User Experience Improvements
- **Warning Notifications**: Shows warnings when sessions are expiring soon (within 30 minutes)
- **Manual Refresh**: Users can manually refresh their session
- **Seamless Experience**: No more unexpected logouts during active use

## Implementation Details

### Files Modified/Created

#### 1. Authentication Configuration (`src/lib/auth.ts`)
- Extended session and JWT maxAge to 30 days
- Added lastActivity tracking in JWT callbacks
- Enhanced session expiration handling

#### 2. Session Utilities (`src/lib/session-utils.ts`)
- `refreshSession()`: Refreshes current session
- `isSessionExpiringSoon()`: Checks if session expires within 1 hour
- `getRemainingSessionTime()`: Calculates remaining session time

#### 3. Enhanced Auth Hook (`src/hooks/use-auth.ts`)
- Automatic session refresh every 10 minutes
- Immediate refresh for sessions expiring soon
- Manual refresh functionality
- Session health monitoring

#### 4. New Session Manager Hook (`src/hooks/use-session-manager.ts`)
- Dedicated session management logic
- Optimized refresh intervals
- Better error handling and logging

#### 5. Session Refresh Component (`src/components/ui/session-refresh.tsx`)
- Visual warning when sessions expire soon
- Manual refresh button
- Auto-dismissing notifications

#### 6. Enhanced Session Provider (`src/components/provider/session-provider.tsx`)
- Automatic refetch every 5 minutes
- Window focus refresh
- Integrated session refresh component

#### 7. Session API Endpoint (`src/app/api/auth/session/route.ts`)
- Server-side session refresh endpoint
- Session validation and health checks

#### 8. Middleware Updates (`middleware.ts`)
- Session expiration monitoring
- Better token validation
- Logging for debugging

#### 9. Utility Functions (`src/lib/utils.ts`)
- Client-side session refresh utilities
- Token expiration checking
- Time remaining calculations

## Usage

### Basic Session Management
```typescript
import { useAuth } from "@/hooks/use-auth"

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    refreshSession, 
    remainingTime,
    isExpiringSoon 
  } = useAuth()

  // Manual refresh
  const handleRefresh = () => {
    refreshSession()
  }

  return (
    <div>
      {isExpiringSoon && (
        <p>Session expires in {remainingTime} minutes</p>
      )}
      <button onClick={handleRefresh}>Refresh Session</button>
    </div>
  )
}
```

### Advanced Session Management
```typescript
import { useSessionManager } from "@/hooks/use-session-manager"

function AdvancedComponent() {
  const { 
    session, 
    status, 
    isRefreshing, 
    refreshSession 
  } = useSessionManager()

  // This hook provides more detailed session management
  return (
    <div>
      <p>Status: {status}</p>
      <p>Refreshing: {isRefreshing ? 'Yes' : 'No'}</p>
      <button onClick={refreshSession}>Force Refresh</button>
    </div>
  )
}
```

### Session Refresh Component
The `SessionRefresh` component automatically appears when sessions are expiring soon:

```typescript
import { SessionRefresh } from "@/components/ui/session-refresh"

// This component is automatically included in the session provider
// It will show warnings and refresh options when needed
```

## Configuration

### Environment Variables
```bash
# NextAuth secret (required)
NEXTAUTH_SECRET=your-secret-here

# Session configuration (optional, defaults shown)
NEXTAUTH_URL=http://localhost:3000
```

### Customization
You can modify session behavior by updating the auth configuration:

```typescript
// In src/lib/auth.ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60,   // Update every 24 hours
}
```

## Testing

### Test Page
Visit `/test-session` to see session management in action:
- Current session information
- Session health status
- Manual refresh functionality
- Debug information

### Console Logs
Monitor browser console for:
- Session refresh attempts
- Expiration warnings
- Refresh success/failure messages

## Troubleshooting

### Common Issues

1. **Sessions still expiring quickly**
   - Check if `NEXTAUTH_SECRET` is set
   - Verify middleware configuration
   - Check browser console for errors

2. **Refresh not working**
   - Ensure API routes are accessible
   - Check network requests in browser dev tools
   - Verify session provider configuration

3. **Multiple refresh calls**
   - Check refresh intervals in hooks
   - Verify minimum refresh time constraints
   - Monitor console for duplicate calls

### Debug Mode
Enable detailed logging by checking browser console and server logs for:
- Session refresh attempts
- Token validation
- Middleware execution
- API endpoint calls

## Security Considerations

- Sessions are automatically refreshed only when users are active
- Minimum refresh intervals prevent abuse
- Server-side validation ensures security
- JWT tokens are properly validated on each request

## Performance Impact

- Minimal performance impact with optimized refresh intervals
- Background refresh doesn't block user interactions
- Smart refresh prevents unnecessary API calls
- Efficient cleanup of intervals and timers

## Future Enhancements

- Configurable refresh intervals
- User preference settings for session duration
- Advanced session analytics
- Multi-device session management
- Session recovery mechanisms
