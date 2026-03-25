# Add Yield Vaults UI to Dashboard

## Description
This PR adds a new "Vaults" tab to the main dashboard navigation for managing Yield Vaults. The feature provides users with visibility into their Total Value Locked (TVL) in Nebula and a breakdown of assets currently earning yield versus idle assets in active streams.

## Technical Changes

### Frontend Changes
- **Navigation**: Added "Vaults" tab to the dashboard sidebar with Shield icon
- **New Page**: Created `/dashboard/vaults` route with comprehensive vault management UI
- **Components**:
  - TVL Card: Displays total value locked across all vault assets
  - Asset Breakdown Card: Shows earning yield vs idle assets with visual progress bar
  - Individual Asset Cards: Detailed view for each token with APY, earning amounts, and idle amounts

### Files Modified
- `frontend/components/dashboard/sidebar.tsx` - Added Vaults navigation item
- `frontend/app/dashboard/vaults/page.tsx` - New vaults dashboard page (created)

## Features Implemented
- ✅ Vaults tab in main navigation
- ✅ Total Value Locked display
- ✅ Asset breakdown (earning yield vs idle)
- ✅ Individual asset cards with detailed metrics
- ✅ Responsive design matching existing dashboard styling
- ✅ Mock data structure for USDC, XLM, and EURC assets

## Testing
- UI components render correctly
- Navigation works properly
- Responsive layout functions on different screen sizes
- TypeScript compilation passes

## Future Work
- Connect to backend API for real vault data
- Add deposit/withdraw functionality
- Implement vault creation/management actions
- Add real-time yield updates

## Screenshots
<!-- Add screenshots of the new vaults interface -->

## Labels
[Frontend] DeFi Medium

## Related Issues
<!-- Link to any related issues or user stories -->