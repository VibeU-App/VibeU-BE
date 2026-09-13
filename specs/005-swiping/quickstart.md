# Quickstart & Verification Guide: Profile Swiping & Matching (Swiping Domain)

**Feature**: `005-swiping`  
**Date**: 2026-09-13  
**Status**: Draft  

---

## 1. Prerequisites & Environment Setup

1. **Database Running**:
   Ensure local or dockerized PostgreSQL database is active:
   ```powershell
   docker ps
   ```

2. **Run Prisma Migrations & Generate Client**:
   After schema updates to `prisma/schema.prisma`:
   ```powershell
   pnpm prisma migrate dev --name add_swipes_and_matches
   pnpm generate # Triggers prisma generate and node scripts/fix-prisma-cjs.js
   ```

3. **Start Application Server**:
   ```powershell
   pnpm start:dev
   ```

---

## 2. End-to-End Validation Scenarios

### Scenario 1: Candidate Deck Retrieval with Strict Opposite-Sex Filter
1. **Prerequisite**:
   - Register and complete User A (Female, e.g. `gender: "FEMALE"`).
   - Register and complete User B (Male, e.g. `gender: "MALE"`).
   - Register and complete User C (Female, e.g. `gender: "FEMALE"`).
2. **Action**:
   - User A calls `GET /api/v1/swipes/deck`.
3. **Expected Outcome**:
   - Status `200 OK`.
   - The candidates list contains User B (Male).
   - The candidates list strictly DOES NOT contain User C (Female) or User A (Self).
   - 100% of returned candidates have `gender === "MALE"`.

---

### Scenario 2: Swipe Right & Instant Mutual Match Detection
1. **Action 1 (User A likes User B)**:
   - User A (Female) calls `POST /api/v1/swipes`:
     ```json
     {
       "targetUserId": "<User_B_ID>",
       "isLike": true
     }
     ```
   - **Expected Outcome**: Status `201 Created`, `data.isMatch: false`, `data.match: null`.
2. **Action 2 (User B likes User A)**:
   - User B (Male) calls `POST /api/v1/swipes`:
     ```json
     {
       "targetUserId": "<User_A_ID>",
       "isLike": true
     }
     ```
   - **Expected Outcome**: Status `201 Created`, `data.isMatch: true`, `data.match.matchedUser.nickname` equals User A's nickname.
3. **Action 3 (Check Matches List)**:
   - User A calls `GET /api/v1/swipes/matches`.
   - **Expected Outcome**: Status `200 OK`, `totalCount: 1`, matches list contains User B.

---

### Scenario 3: Already-Swiped Exclusion from Deck
1. **Action**:
   - User A calls `GET /api/v1/swipes/deck` again.
2. **Expected Outcome**:
   - User B no longer appears in User A's swipe deck.

---

### Scenario 4: Duplicate Swipe Prevention & Same-Sex Rejection
1. **Duplicate Swipe Test**:
   - User A submits a duplicate swipe on User B:
     `POST /api/v1/swipes` with `targetUserId: <User_B_ID>`.
   - **Expected Outcome**: Status `409 Conflict` (`"You have already swiped on this profile"`).
2. **Same-Sex Swipe Test**:
   - User A (Female) attempts direct API swipe on User C (Female):
     `POST /api/v1/swipes` with `targetUserId: <User_C_ID>`.
   - **Expected Outcome**: Status `400 Bad Request` (`"Cannot swipe on users of the same sex"`).

---

### Scenario 5: Unmatching a Connection
1. **Action**:
   - User A calls `DELETE /api/v1/swipes/matches/:matchId`.
2. **Expected Outcome**:
   - Status `200 OK`, `data.success: true`.
   - User A calls `GET /api/v1/swipes/matches` -> `totalCount: 0`.
   - User B calls `GET /api/v1/swipes/matches` -> `totalCount: 0`.
   - Both users still do not reappear in each other's swipe deck (swipes preserved).

---

## 3. Automated Unit & Integration Tests

Run the pure TypeScript use case tests:
```powershell
pnpm test src/use-cases/swiping
```
