# Authentication Profile Persistence Bug Fix

## Summary
Fixed a critical mobile-specific authentication bug where logging out and logging in with a different account would incorrectly display the previous account's profile data.

## Root Cause
1. **React Query cache persistence**: User profile and recipe data remained in memory after logout
2. **Incomplete localStorage cleanup**: `has_registered` flag and other user artifacts persisted
3. **No defensive checks**: Login flow didn't explicitly clear stale sessions
4. **Mobile memory management**: Mobile browsers preserve cache longer than desktop

## Changes Implemented

### 1. Enhanced Logout Flow (`src/contexts/AuthContext.tsx`)
**What was changed:**
- Clear React Query cache completely via `queryClient.clear()`
- Remove ALL localStorage items (including `has_registered`, Supabase tokens, user/profile/recipe keys)
- Clear sessionStorage
- Reset all React state (`user`, `session`, `isReturningUser`)
- Added error handling for network failures
- Implement local-only signout as fallback

**Edge cases handled:**
- Network failure during logout → force local cleanup
- Partial logout → comprehensive cleanup ensures no artifacts remain
- Concurrent tabs → each tab clears its own storage

### 2. Defensive Login Flow (`src/contexts/AuthContext.tsx`)
**What was changed:**
- Pre-login cleanup: Clear any existing session before new login
- Clear React Query cache before authentication
- Remove localStorage artifacts
- 100ms delay to ensure cleanup completes

**Why this matters:**
- Prevents race conditions where stale data loads before new auth
- Ensures completely fresh start for new user session

### 3. Profile Fetching Guards (`src/hooks/useUserProfile.ts`)
**What was changed:**
- Added user ID verification: Reject mismatched profiles
- Set `staleTime: 0` and `gcTime: 0` to prevent cache reuse
- Query key includes user ID for proper scoping
- useEffect cleanup when user changes

**Protection added:**
- Validates fetched profile matches current user
- Prevents stale cache from being displayed
- Forces fresh fetch on every mount

### 4. Library Recipes Scoping (`src/hooks/useLibraryRecipes.ts`)
**What was changed:**
- Include user ID in query key: `["library-recipes", user?.id]`
- Filter results to match current user (defensive)
- Set `staleTime: 0` and `gcTime: 0`
- Return empty array if no user

**Why this matters:**
- Same bug could affect saved recipes
- Prevents Account A's recipes appearing for Account B

### 5. Visual Feedback (`src/pages/Chat.tsx`, `src/pages/LandingPage.tsx`)
**What was changed:**
- Toast notifications on logout success/failure
- Force full page reload after logout (800ms delay for toast visibility)
- Error handling with user feedback

**Mobile benefit:**
- Clear visual confirmation logout completed
- Full page reload ensures complete state reset
- Better UX on touch devices

## Testing Instructions

### Manual Test Procedure

#### Test 1: Basic Profile Switching
1. **Setup**: Create two test accounts
   - Account A: `test-a@example.com`
   - Account B: `test-b@example.com`

2. **Execute**:
   ```
   1. Login with Account A
   2. Navigate to Profile → fill in preferences (servings, cuisines, etc.)
   3. Save a recipe to library
   4. Logout (verify toast appears: "Logged out successfully")
   5. Wait for page reload
   6. Login with Account B credentials
   7. Navigate to Profile
   ```

3. **Expected Result**:
   - Profile should be empty or show Account B's data
   - NO Account A data should appear
   - Library should be empty (no Account A recipes)

4. **Failure Indicator**:
   - Account A's name/preferences appear briefly or permanently
   - Account A's saved recipes visible

#### Test 2: Rapid Profile Switching
1. Login Account A → Logout → Login Account B → Logout → Login Account A
2. Repeat 3-5 times rapidly
3. Verify correct profile loads each time

#### Test 3: Network Failure During Logout
1. Login Account A
2. Open browser DevTools → Network tab → Go offline
3. Click Logout
4. Verify toast still appears and local cleanup happens
5. Go back online
6. Login Account B
7. Verify Account B's profile loads correctly

#### Test 4: Mobile-Specific Testing
**Required**: Test on actual mobile device or mobile emulator

1. Open app on mobile browser (Chrome/Safari iOS or Android)
2. Login Account A → add profile data → save recipe
3. Background app (press home button)
4. Open app again (should still be logged in)
5. Logout → verify toast and reload
6. Login Account B
7. Verify no Account A data persists

**Mobile-specific checks:**
- Does cache survive app backgrounding?
- Does full page reload properly clear memory?
- Is toast visible before reload?

#### Test 5: Concurrent Tabs (Desktop)
1. Open app in Tab 1 → Login Account A
2. Open app in Tab 2 → Login Account B
3. In Tab 1, refresh → should still show Account A
4. In Tab 2, logout → refresh Tab 1
5. Tab 1 should now be logged out (Supabase handles this)

### Automated Test Coverage (Recommended)

```typescript
// Example test structure (to be implemented)

describe('Authentication Profile Persistence', () => {
  test('logout clears all storage', async () => {
    // Login
    await signIn('test-a@example.com', 'password');
    
    // Verify storage populated
    expect(localStorage.getItem('has_registered')).toBeTruthy();
    
    // Logout
    await signOut();
    
    // Verify storage cleared
    expect(localStorage.getItem('has_registered')).toBeNull();
    expect(sessionStorage.length).toBe(0);
    // Verify React Query cache cleared
    expect(queryClient.getQueryCache().getAll().length).toBe(0);
  });

  test('login with different credentials loads correct profile', async () => {
    // Login Account A
    await signIn('test-a@example.com', 'password');
    const profileA = await screen.findByText('Account A Name');
    expect(profileA).toBeInTheDocument();
    
    // Logout
    await signOut();
    
    // Login Account B
    await signIn('test-b@example.com', 'password');
    const profileB = await screen.findByText('Account B Name');
    expect(profileB).toBeInTheDocument();
    
    // Verify Account A data NOT present
    expect(screen.queryByText('Account A Name')).not.toBeInTheDocument();
  });

  test('switching profiles multiple times works correctly', async () => {
    for (let i = 0; i < 3; i++) {
      // Login A
      await signIn('test-a@example.com', 'password');
      expect(await screen.findByText('Account A')).toBeInTheDocument();
      await signOut();
      
      // Login B
      await signIn('test-b@example.com', 'password');
      expect(await screen.findByText('Account B')).toBeInTheDocument();
      await signOut();
    }
  });

  test('network failure during logout still clears local data', async () => {
    await signIn('test-a@example.com', 'password');
    
    // Simulate network failure
    server.use(
      http.post('*/auth/v1/logout', () => {
        return HttpResponse.error();
      })
    );
    
    await signOut();
    
    // Verify local cleanup happened despite network error
    expect(localStorage.getItem('has_registered')).toBeNull();
    expect(queryClient.getQueryCache().getAll().length).toBe(0);
  });
});
```

## Verification Checklist

- [ ] Logout clears React Query cache
- [ ] Logout clears localStorage completely
- [ ] Logout clears sessionStorage
- [ ] Login performs pre-cleanup
- [ ] Profile queries include user ID in key
- [ ] Recipe queries include user ID in key
- [ ] Profile mismatch detection works
- [ ] Toast notifications appear on mobile
- [ ] Full page reload occurs after logout
- [ ] Network failure doesn't break logout
- [ ] Multiple profile switches work correctly
- [ ] No stale data appears after login
- [ ] Mobile testing completed
- [ ] Desktop testing completed

## Known Limitations

1. **Concurrent tabs**: If same user is logged in multiple tabs, logout in one tab will affect others (Supabase behavior)
2. **Service workers**: If app uses service workers (not currently), additional cleanup may be needed
3. **IndexedDB**: Current implementation doesn't use IndexedDB, but if added, would need cleanup
4. **Browser extensions**: Cannot control third-party extensions that might cache data

## Performance Impact

- **Logout latency**: Added ~100-900ms (cleanup + toast display)
- **Login latency**: Added ~100ms (pre-cleanup)
- **Memory**: More aggressive cache eviction (gcTime: 0) increases server requests
- **Mobile**: Full page reload ensures clean state but adds navigation time

**Tradeoff justified**: Correctness over performance. User data integrity is critical.

## Monitoring Recommendations

1. **Track logout failures**: Log to analytics when network logout fails
2. **Profile mismatch events**: Alert if defensive check catches mismatch
3. **Query invalidation frequency**: Monitor if gcTime: 0 causes excessive refetching
4. **Mobile vs desktop logout times**: Compare performance metrics

## Rollback Plan

If issues arise:
1. Revert `src/contexts/AuthContext.tsx` changes
2. Revert `src/hooks/useUserProfile.ts` staleTime changes
3. Keep defensive profile verification (low risk)
4. Monitor for bug reappearance

## Future Improvements

1. **Implement proper E2E tests**: Playwright/Cypress tests for profile switching
2. **Add logout confirmation modal**: "Are you sure?" prevents accidental logouts
3. **Optimize cache strategy**: Balance freshness vs performance (consider 30s staleTime)
4. **Add session monitoring**: Detect and warn about concurrent sessions
5. **Implement proper service worker**: For offline support with proper cache invalidation
