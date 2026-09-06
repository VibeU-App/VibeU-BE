# Feature Specification: Post & Comment Management (Posting Domain)

**Feature Branch**: `004-posts`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "code the posting domain. Users can post their text and also iamges. Users can pin or delete the post, those images show basic UI for this feature. Generate the specification for this domain please"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Post Creation with Text & Images (Priority: P1)

Authenticated users must be able to create and publish posts containing text status messages, image attachments, or both.

**Why this priority**: Core functionality of the posting domain and primary entry point for user engagement.

**Independent Test**: Verified by submitting post creation requests with text only, images only, and text + images combined, confirming the post appears in the feed with correct attributes.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the Posting screen, **When** they enter text content and/or select image attachments and tap "Post", **Then** the system creates the post and makes it visible on their profile feed.
2. **Given** an authenticated user on the Posting screen, **When** they attempt to submit a post with empty text and no images attached, **Then** the system rejects post creation with a validation error.
3. **Given** an authenticated user uploading images, **When** they attach up to 5 image URLs, **Then** the system persists all image references associated with the post.

---

### User Story 2 - Pinning & Unpinning Posts (Priority: P1)

Users must be able to pin a specific post to the top of their profile feed so that it remains prominently featured, or unpin a currently pinned post.

**Why this priority**: Essential profile customization feature that allows users to highlight their favorite or most important post.

**Independent Test**: Verified by pinning a post and checking that profile feed queries return the pinned post at the top position, then pinning a second post to confirm the previous one is unpinned.

**Acceptance Scenarios**:

1. **Given** a user viewing their post options menu ("Config post"), **When** they select "Pin this post", **Then** that post's status changes to pinned and it is displayed at the top of their profile feed.
2. **Given** a user who already has a pinned post, **When** they pin another post, **Then** the system unpins the previously pinned post so that only 1 post remains pinned per user profile.
3. **Given** a user with a pinned post, **When** they select "Unpin this post", **Then** the post returns to its normal chronological position in the feed.

---

### User Story 3 - Deleting Posts (Priority: P1)

Users must be able to delete any post they have previously created.

**Why this priority**: Critical user control feature for content management and privacy.

**Independent Test**: Verified by selecting "Delete this post" on an existing post and confirming it is no longer returned in profile feeds, post details, or comment lists.

**Acceptance Scenarios**:

1. **Given** a user viewing their post options menu ("Config post"), **When** they select "Delete this post" and confirm, **Then** the system soft-deletes or removes the post and its associated comments.
2. **Given** a user viewing a post created by another user, **When** they open post options, **Then** the option to delete the post is not available.

---

### User Story 4 - Feed & Post Detail Viewing (Priority: P2)

Users must be able to view posts with author metadata (avatar, nickname), creation timestamp, text content, image attachments, comment count, and like count.

**Why this priority**: Essential for content consumption and social interactions across the application.

**Independent Test**: Verified by fetching a profile or main feed and validating that all post fields and aggregate metrics render accurately.

**Acceptance Scenarios**:

1. **Given** a user viewing a profile feed, **When** the feed loads, **Then** posts are displayed with author avatar, author nickname, formatted creation timestamp (e.g. `11:30, 20/07/2026`), text body, attached images, like count, and comment count.
2. **Given** a feed containing a pinned post, **When** the user loads the feed, **Then** the pinned post is positioned above all unpinned chronological posts.

---

### User Story 5 - Post Commenting (Priority: P2)

Users must be able to view comments on a post and add new comments.

**Why this priority**: Drives user interaction and conversation around shared posts.

**Independent Test**: Verified by fetching post comments, submitting a new comment, and checking that the comment appears in the list and the post's comment count increments by 1.

**Acceptance Scenarios**:

1. **Given** a user on the Post Detail screen ("Watch comment" / "Commenting"), **When** they enter text into the comment input field and tap send, **Then** the comment is created and immediately displayed in the comments list.
2. **Given** a post with existing comments, **When** a user views the post detail, **Then** comments are displayed in chronological order with comment author avatar, nickname, timestamp, and content.
3. **Given** a post receiving a new comment, **When** the comment is successfully saved, **Then** the parent post's aggregate comment count increases by 1.

---

### Edge Cases

- **Empty Post Content**: A post creation request missing both text content and images must be rejected with a 400 Bad Request error.
- **Maximum Image Attachment Limit**: A single post can attach a maximum of 5 images. Submissions exceeding this limit must be rejected.
- **Single Pinned Post Constraint**: Each user profile can have at most 1 active pinned post. Pinning a new post automatically unpins any existing pinned post for that user.
- **Cascading Post Deletion**: Deleting a post automatically soft-deletes/removes all associated comments and clears its pinned status if it was pinned.
- **Comment Length Limits**: Comment text must be non-empty and limited to a maximum of 500 characters.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow authenticated users to create posts containing text content (max 2000 characters), image media URLs (max 5 images), or both.
- **FR-002**: The system MUST validate that a post contains at least text content or 1 image URL before allowing creation.
- **FR-003**: The system MUST allow post authors to toggle the pinned status (`isPinned`) of their posts, enforcing a constraint of at most 1 pinned post per user profile.
- **FR-004**: The system MUST allow post authors to delete their own posts.
- **FR-005**: The system MUST support retrieving posts for a user profile, returning posts sorted with pinned posts first, followed by unpinned posts in descending chronological order (`createdAt`).
- **FR-006**: The system MUST include author profile details (nickname, avatar seed/URL), creation timestamp, content, attached image URLs, pinned status, like count, and comment count in post representations.
- **FR-007**: The system MUST allow authenticated users to add comments (max 500 characters) to any active post.
- **FR-008**: The system MUST support fetching comments for a specific post in ascending chronological order (`createdAt`).
- **FR-009**: The system MUST dynamically aggregate and update comment counts (`commentCount`) and like counts (`likeCount`) on posts.

### Key Entities *(include if feature involves data)*

- **Post**:
  - `id`: Unique identifier (UUID).
  - `authorId`: Foreign key to user Profile.
  - `content`: Text body of post (String, max 2000 characters, nullable if images present).
  - `mediaUrls`: List of image URL strings attached to the post (Array of Strings, max 5 elements).
  - `isPinned`: Boolean flag indicating if post is pinned on author's profile (Default: `false`).
  - `likeCount`: Integer count of post likes (Default: `0`).
  - `commentCount`: Integer count of comments (Default: `0`).
  - `createdAt`: ISO 8601 creation timestamp.
  - `updatedAt`: ISO 8601 last modification timestamp.
  - `deletedAt`: Optional timestamp for soft deletion.

- **Comment**:
  - `id`: Unique identifier (UUID).
  - `postId`: Foreign key to parent Post.
  - `authorId`: Foreign key to user Profile.
  - `content`: Text body of comment (String, 1-500 characters).
  - `createdAt`: ISO 8601 creation timestamp.
  - `deletedAt`: Optional timestamp for soft deletion.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Post creation requests respond in under 200 milliseconds.
- **SC-002**: Profile feed query returning 20 posts with author details and aggregate counts executes in under 100 milliseconds.
- **SC-003**: Pinning/unpinning a post updates and reflects in feed queries instantly (under 50 milliseconds).
- **SC-004**: 100% of deleted posts are removed from active feed and comment listings immediately.

## Assumptions

- **A-001**: Image upload binary handling and cloud media storage (e.g. S3 / CDN) occur via presigned URLs prior to post submission; backend receives validated image URL strings.
- **A-002**: User profile identification (`authorId`) is resolved from authenticated request JWT session context.
- **A-003**: Post likes/reactions are counted as an aggregate integer; detailed like reaction handling can extend from this domain schema.
