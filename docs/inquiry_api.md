# Inquiry API / data contract (Phase 3)

## Backend choice

**Firestore-native threads** (default in production and normal local runs).

| Mode | When |
|------|------|
| Firestore | Default (`getInquiryBackend() === "firestore"`) |
| REST | `VITE_INQUIRY_API_BASE` set |
| localStorage demo | `DEV` **and** `VITE_INQUIRY_DEMO_LOCAL=true` only |

Production builds never use localStorage for inquiries.

## Collections

### `inquiries/{inquiryId}`

| Field | Type | Notes |
|-------|------|--------|
| `productId` | string | Required |
| `shopId` | string | Vendor shop; may be `""` if product not linked |
| `buyerUid` | string | Auth uid (required for create) |
| `buyerName` | string | |
| `phone` | string | Validated 10–15 digits |
| `productName` | string | |
| `vendorName` | string | |
| `vendorLocation` | string | |
| `status` | string | see below |
| `preview` | string | Last message snippet |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**Status:** `open` \| `awaiting_vendor` \| `awaiting_buyer` \| `closed` \| `won` \| `lost`

### `inquiries/{inquiryId}/messages/{messageId}`

| Field | Type |
|-------|------|
| `role` | `buyer` \| `vendor` |
| `senderName` | string |
| `senderRole` | string |
| `senderUid` | string |
| `body` | string (max 2000) |
| `createdAt` | timestamp |

## Client operations (`inquiryChatApi.js` / `inquiryFirestoreService.js`)

Equivalent to REST:

| Op | Firestore |
|----|-----------|
| Create inquiry + first message | `createInquiry` → `createFirestoreInquiry` |
| List buyer inquiries | `listUserInquiries({ buyerUid })` |
| List shop inquiries | `listShopInquiries(shopId)` (Phase 4) |
| Get messages | `fetchMessages` |
| Subscribe messages | `subscribeMessages` → `onSnapshot` |
| Send buyer message | `sendBuyerMessage` |
| Send vendor message | `sendVendorMessage` |

### Optional REST (`VITE_INQUIRY_API_BASE`)

- `POST /inquiries`
- `GET /inquiries`
- `GET /inquiries/:id/messages`
- `POST /inquiries/:id/messages` `{ body }`

## Security

Enforced by `firestore.rules`: signed-in buyer owns thread; shop members / admin can read & reply.

## Indexes

Deploy with:

```bash
firebase deploy --only firestore:indexes
```

Defined in `firestore.indexes.json` (`buyerUid+productId`, `buyerUid+updatedAt`, `shopId+updatedAt`).

## Validation

- Name 2–120 chars
- Phone 10–15 digits
- Message 1–2000 chars
