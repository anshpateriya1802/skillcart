# Postman Collection for SkillCerts API

Complete Postman collection with all endpoints in ONE file with shared variables.

## 📁 Collection File

### **skillcerts-complete.postman.json** - Complete API Collection

✅ **Single collection** - All endpoints in one place
✅ **Shared variables** - Token saved once, works everywhere
✅ **Auto-save everything** - Token, course ID, user ID

**Organized Folders:**
1. **User & Authentication**
   - Sign Up (Student/Instructor) - Auto-saves token
   - Sign In - Auto-saves token & user ID
   - Get Profile

2. **Courses**
   - **Public** - Get all, search, filter (no auth needed)
   - **Instructor** - Create, update, publish, delete (auto-saves course ID)

3. **Error Tests**
   - Auth errors, validation errors, authorization errors

## 🚀 Quick Start

### Import to Postman

1. Open Postman
2. Click **Import** button
3. Drag and drop `skillcerts-complete.postman.json`
4. One collection appears with all folders!

### Start Testing

1. **Start Server**
   ```bash
   npm run dev
   ```

2. **Test Flow**
   - **Folder 1**: Sign Up Instructor → Sign In (token auto-saves!)
   - **Folder 2 > Instructor**: Create Course (ID auto-saves!)
   - **Folder 2 > Instructor**: Publish Course
   - **Folder 2 > Public**: Get All Courses (no token needed!)

## 🔧 Shared Variables

The collection uses these variables **across all folders**:

| Variable | Default | Auto-saved | Description |
|----------|---------|------------|-------------|
| `baseUrl` | `http://localhost:3000/api` | ❌ | API base URL |
| `authToken` | (empty) | ✅ | JWT token - saved on signup/signin |
| `courseId` | (empty) | ✅ | Last created course ID |
| `userId` | (empty) | ✅ | Current user ID |

**Key Point**: Token saved in User folder works in Course folder! 🎉

### Update Variables

1. Click collection name
2. Go to **Variables** tab
3. Update `baseUrl` if needed
4. Other variables auto-update

## 📋 Complete Testing Flow

### 1. Create Instructor Account
**Folder**: 1. User & Authentication
```
Run: Sign Up Instructor
✅ Token auto-saved
✅ User ID auto-saved
```

### 2. Create Course
**Folder**: 2. Courses > Instructor
```
Run: Create Course
✅ Uses token from step 1 automatically!
✅ Course ID auto-saved
```

### 3. Publish Course
**Folder**: 2. Courses > Instructor
```
Run: Publish Course
✅ Uses saved token and course ID
```

### 4. View Public Courses
**Folder**: 2. Courses > Public
```
Run: Get All Courses
✅ No token needed - public endpoint
✅ See your published course
```

### 5. Test Authorization
**Folder**: 1. User & Authentication + 2. Courses
```
1. Sign Up Student (overwrites token with student token)
2. Try: Create Course (in Instructor folder)
❌ Should fail with 403 Forbidden
```

## ✨ Key Features

### 🔄 Shared Variables Magic
- Sign in once → Token works in ALL folders
- Create course once → ID available everywhere
- No manual copy-paste needed!

### 📁 Smart Organization
```
skillcerts-complete.postman.json
├── 1. User & Authentication
│   ├── Sign Up Student
│   ├── Sign Up Instructor
│   ├── Sign In
│   └── Get My Profile
├── 2. Courses
│   ├── Public
│   │   ├── Get All Courses
│   │   ├── Search Courses
│   │   ├── Filter by Level
│   │   ├── Filter Free Courses
│   │   ├── Combined Filters
│   │   └── Get Course by ID
│   └── Instructor
│       ├── Create Course
│       ├── Create Free Course
│       ├── Get My Courses
│       ├── Update Course
│       ├── Publish Course
│       └── Delete Course
└── 3. Error Tests
    ├── Auth Errors
    │   ├── Sign Up - Missing Fields
    │   ├── Sign In - Invalid Password
    │   └── Get Profile - No Token
    └── Course Errors
        ├── Create Course - No Auth
        ├── Create Course - Invalid Data
        └── Get Course - Not Found
```

### ✅ Auto-Save Test Scripts
Every important request has test scripts:
- **Sign Up/Sign In**: Saves token + user ID
- **Create Course**: Saves course ID
- Console logs success messages

## 🧪 Test Checklist

### User & Auth ✅
- [ ] Sign up as student
- [ ] Sign up as instructor (token saved)
- [ ] Sign in (token saved)
- [ ] Get profile with token
- [ ] Test invalid credentials (401)
- [ ] Test missing fields (400)
- [ ] Test no token (401)

### Courses - Public ✅
- [ ] Get all courses (no token)
- [ ] Search by keyword
- [ ] Filter by level (beginner/intermediate/advanced)
- [ ] Filter by price (free/paid)
- [ ] Combined filters
- [ ] Get course by ID

### Courses - Instructor ✅
- [ ] Create course (token + ID saved)
- [ ] Create free course
- [ ] Get my courses
- [ ] Update course (uses saved ID)
- [ ] Publish course (uses saved ID)
- [ ] Delete course

### Authorization ✅
- [ ] Student can't create course (403)
- [ ] Can't update other's course (403)
- [ ] Invalid data returns 400
- [ ] Not found returns 404

## 💡 Pro Tips

1. **Run folder in sequence**: Right-click folder → "Run folder"
2. **Check console**: View → Show Postman Console for auto-save logs
3. **Verify variables**: Click collection → Variables tab to see saved values
4. **Multiple users**: Duplicate requests and change email for testing
5. **Save responses**: Right-click response → "Save as example"

## 🔍 Response Structure

All responses follow this format:
```json
{
  "success": true,
  "message": "Description",
  "data": { /* response data */ },
  "statusCode": 200,
  "timestamp": "2025-12-20T10:30:00.000Z"
}
```

## 🐛 Troubleshooting

**Token not working?**
- Check Variables tab - is `authToken` filled?
- Re-run Sign In to refresh token
- Check console for auto-save logs

**Course ID empty?**
- Run Create Course first
- Check Variables tab for `courseId`
- Console will log "Course ID saved: ..."

**403 Forbidden on Create Course?**
- Make sure you signed up as **instructor**, not student
- Check token is valid (sign in again)

**Can't see published course?**
- Run "Publish Course" first
- Public endpoints only show `published: true` courses

## 🎯 Why One Collection?

**Before** (separate files):
- ❌ Token in user.json doesn't work in courses.json
- ❌ Need to copy-paste token manually
- ❌ Variables not shared

**After** (one collection):
- ✅ Token shared across all folders
- ✅ Course ID shared across all folders
- ✅ Auto-save works everywhere
- ✅ Easier to manage

Import `skillcerts-complete.postman.json` and start testing! 🚀
