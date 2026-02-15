# ReturnIQ Seller Dashboard

## Architecture Overview

A centralized return management system for D2C brands, designed with a modular, event-driven architecture that supports seamless integration with the dropoff_store dashboard and returniq user dashboard.

## System Design Principles

### 1. Loose Coupling
- Dashboards communicate only through API layer
- No shared component imports between folders
- Independent deployment capability

### 2. Event-Driven Architecture
- Real-time status sync via event system
- WebSocket-ready design for future implementation
- All status changes emit events for cross-dashboard updates

### 3. Schema Consistency
- Single source of truth in `types/index.ts`
- Enum-based status definitions
- Extensible without breaking changes

## Project Structure

```
seller_dashboard/
├── src/
│   ├── app/
│   │   ├── api/                    # Backend API routes
│   │   │   ├── analytics/          # Analytics endpoints
│   │   │   ├── returns/            # Return CRUD operations
│   │   │   └── stores/             # Dropoff store lookup
│   │   ├── layout.tsx              # Root layout
│   │   └── page.tsx                # Main dashboard
│   ├── components/
│   │   ├── AnalyticsCards.tsx      # Metric display
│   │   ├── FilterBar.tsx           # Search & filter
│   │   ├── ReturnsTable.tsx        # Returns data table
│   │   ├── Sidebar.tsx             # Navigation
│   │   ├── StatusBadge.tsx         # Status indicators
│   │   └── TrustScoreBadge.tsx     # Trust score display
│   ├── data/
│   │   └── mockData.ts             # Development data
│   ├── hooks/
│   │   └── useReturns.ts           # Data fetching hooks
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── services/
│   │   └── returnService.ts        # API service layer
│   └── types/
│       └── index.ts                # Centralized types
```

## Return Status Workflow

```
initiated → dropoff_selected → collected → in_transit → seller_received → verified → [refund_approved | refund_rejected | fraud_flagged] → completed
```

## API Integration Layer

### For dropoff_store (Future Integration)

The dropoff_store dashboard should:

1. **Use the same API endpoints:**
   ```typescript
   // Mark as collected
   PATCH /api/returns/{id}/status
   {
     "status": "collected",
     "changed_by": "dropoff_store",
     "metadata": { "store_id": "store_001" }
   }
   ```

2. **Listen to events:**
   ```typescript
   ReturnEventSystem.subscribe('status:changed', (event) => {
     // Update UI when status changes
   });
   ```

3. **Use shared types:**
   ```typescript
   import { ReturnItem, ReturnStatus } from '@/types';
   ```

### Key Integration Endpoints

| Endpoint | Method | Purpose | Used By |
|----------|--------|---------|---------|
| `/api/returns` | GET | List returns | Both |
| `/api/returns` | POST | Create return | returniq |
| `/api/returns/{id}` | GET | Get return details | Both |
| `/api/returns/{id}/status` | PATCH | Update status | Both |
| `/api/analytics` | GET | Get metrics | seller_dashboard |
| `/api/stores` | GET | List stores | Both |

## Event System

### Status Change Events

All status updates emit events for real-time sync:

```typescript
interface StatusChangeEvent {
  return_id: string;
  previous_status: ReturnStatusType;
  new_status: ReturnStatusType;
  changed_by: 'seller' | 'dropoff_store' | 'system';
  timestamp: string;
  metadata?: Record<string, unknown>;
}
```

### Subscribing to Events

```typescript
// In any component
const unsubscribe = ReturnEventSystem.subscribe('status:changed', (event) => {
  console.log(`Return ${event.return_id} changed to ${event.new_status}`);
});

// Cleanup
unsubscribe();
```

## Data Schema

### Return Object

```typescript
interface ReturnItem {
  return_id: string;              // Unique identifier
  order_id: string;               // Original order reference
  user_id: string;                // Customer identifier
  seller_id: string;              // Seller identifier
  product_id: string;             // Product identifier
  product_name: string;           // Display name
  product_price: number;          // Amount
  dropoff_store_id: string;       // Selected store
  dropoff_store_name: string;     // Store display name
  qr_code_id: string;             // QR reference
  status: ReturnStatusType;       // Current status
  trust_score: number;            // 0-100 fraud score
  condition_status: ConditionStatusType;
  refund_status: RefundStatusType;
  return_reason: string;          // Customer reason
  user_comment?: string;          // Additional details
  seller_notes?: string;          // Internal notes
  rejection_reason?: string;      // If rejected
  timestamps...                  // Audit fields
}
```

## Seller Actions

### Available Actions by Status

| Current Status | Available Actions |
|----------------|-------------------|
| `seller_received` | Mark as Verified, Flag Fraud |
| `verified` | Approve Refund, Reject Refund, Flag Fraud |
| Any (except completed/fraud) | Flag Fraud |

### Action Implementation

All actions go through `ReturnService`:

```typescript
// Approve refund
await ReturnService.approveRefund(returnId);

// Reject with reason
await ReturnService.rejectRefund(returnId, "Product damaged beyond policy");

// Flag fraud
await ReturnService.flagFraud(returnId, "Serial returner pattern detected");
```

## Analytics

### Available Metrics

- **Total Returns Today**: Count of new submissions
- **Pending Verification**: Awaiting seller review
- **Fraud Flagged**: Under investigation
- **Refund Approved %**: Approval rate
- **Logistics Cost Saved**: Via batch pickup vs individual

## UI Components

### StatusBadge

Displays colored badges for:
- Return status (10 states)
- Condition status (6 states)
- Refund status (5 states)

### TrustScoreBadge

Circular progress indicator showing:
- 80-100: High Trust (Green)
- 60-79: Medium Trust (Orange)
- 40-59: Low Trust (Red-orange)
- 0-39: Suspicious (Red)

## Theming

- **Background**: `#0b0f19` (Dark navy)
- **Surface**: `#111827` (Dark gray)
- **Border**: `#1f2937` / `#374151`
- **Text Primary**: `#f3f4f6`
- **Text Secondary**: `#9ca3af`
- **Accent**: `#3b82f6` (Blue)

## Development

### Running Locally

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

## Future Enhancements

1. **Real-time WebSocket** implementation for live updates
2. **Bulk operations** for processing multiple returns
3. **Advanced analytics** with charts and trends
4. **Notification system** for status changes
5. **Integration with payment gateways** for automated refunds

## Integration Checklist for dropoff_store

When building the dropoff_store dashboard:

- [ ] Import shared types from `types/index.ts`
- [ ] Use `ReturnService` for all API calls
- [ ] Subscribe to `status:changed` events
- [ ] Implement QR scanning to call `markAsCollected()`
- [ ] Use same status enums and configurations
- [ ] Test end-to-end flow with seller_dashboard

---

**Built for the ReturnIQ Ecosystem** | **Event-Driven** | **Production-Ready**
