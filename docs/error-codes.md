# VibeU API Error Codes Reference

This document serves as the official error code reference for Frontend (FE) and Mobile clients interacting with the VibeU Backend API.

---

## 1. Response Envelope Format

All API responses follow a unified **Envelope** structure. In case of an error, `data` is `null` and the `metadata` object contains the machine-readable `errorCode` and request `timestamp`.

### Standard Error Response Format
```json
{
  "statusCode": 400,
  "message": "Invalid or incorrect OTP code",
  "data": null,
  "metadata": {
    "errorCode": "AUTH_1005",
    "timestamp": "2026-09-07T00:15:00.000Z"
  }
}
```

### TypeScript Interface for Frontend
```typescript
export interface ErrorEnvelope {
  statusCode: number;
  message: string;
  data: null;
  metadata: {
    errorCode: ErrorCode;
    timestamp: string;
  };
}
```

---

## 2. Complete Error Code Catalog

### Authentication & Authorization Errors (`AUTH_1xxx`)

| Error Code | HTTP Status | Vietnamese Meaning (*Ý nghĩa tiếng Việt*) |
|---|---|---|
| `AUTH_1001` | `401 Unauthorized` | Email hoặc mật khẩu không chính xác |
| `AUTH_1002` | `409 Conflict` | Email này đã được đăng ký tài khoản |
| `AUTH_1003` | `401 Unauthorized` | Token xác thực không hợp lệ |
| `AUTH_1004` | `401 Unauthorized` | Token xác thực đã hết hạn |
| `AUTH_1005` | `400 Bad Request` | Mã OTP không đúng hoặc đã vượt quá số lần thử |
| `AUTH_1006` | `400 Bad Request` | Mã OTP đã hết hạn, vui lòng yêu cầu mã mới |
| `AUTH_1007` | `404 Not Found` | Không tìm thấy tài khoản với email này |
| `AUTH_1008` | `400 Bad Request` | Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt |
| `AUTH_1009` | `400 Bad Request` | Vui lòng cung cấp địa chỉ email hợp lệ (.edu) |
| `AUTH_1010` | `403 Forbidden` | Bạn không có quyền truy cập tài nguyên này |
| `AUTH_1011` | `401 Unauthorized` | Vui lòng xác thực email trước khi đăng nhập |
| `AUTH_1012` | `400 Bad Request` | Mật khẩu mới phải khác với mật khẩu cũ |
| `AUTH_1013` | `401 Unauthorized` | Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại |

---

### Profile & Questionnaire Errors (`PROFILE_1xxx`)

| Error Code | HTTP Status | Vietnamese Meaning (*Ý nghĩa tiếng Việt*) |
|---|---|---|
| `PROFILE_1001` | `404 Not Found` | Không tìm thấy hồ sơ của người dùng này |
| `PROFILE_1002` | `400 Bad Request` | Bạn phải từ 18 tuổi trở lên để sử dụng ứng dụng |

---

### Validation & Request Errors (`VAL_2xxx`)

| Error Code | HTTP Status | Vietnamese Meaning (*Ý nghĩa tiếng Việt*) |
|---|---|---|
| `VAL_2001` | `400 Bad Request` | Dữ liệu gửi lên không hợp lệ |

---

### Server Errors (`SRV_5xxx`)

| Error Code | HTTP Status | Vietnamese Meaning (*Ý nghĩa tiếng Việt*) |
|---|---|---|
| `SRV_5001` | `500 Internal Server Error` | Đã xảy ra lỗi hệ thống, vui lòng thử lại sau |

---

## 3. Frontend Error Handling Best Practices

1. **Always switch on `metadata.errorCode`**:
   Do **not** parse or rely on the text `message` string for logic branching, as it may change with localization.
   ```typescript
   function handleApiError(error: ErrorEnvelope) {
     const code = error.metadata?.errorCode;
     switch (code) {
       case 'AUTH_1004': // Token expired
         return refreshTokenAndRetry();
       case 'AUTH_1013': // Session expired
       case 'AUTH_1003': // Invalid token
         return logoutAndRedirectToLogin();
       case 'AUTH_1011': // Unverified email
         return navigateToVerifyEmail();
       case 'PROFILE_1001': // Profile not found
         return navigateToProfileOnboarding();
       default:
         showToast(error.message);
     }
   }
   ```

2. **Automated Token Refresh Flow**:
   When receiving HTTP `401` with `AUTH_1004`, intercept the request, invoke `POST /auth/refresh` with the stored `refreshToken`, store the new token pair, and replay the original request.
