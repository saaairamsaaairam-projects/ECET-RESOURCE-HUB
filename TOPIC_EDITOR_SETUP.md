## 🎯 Professional TipTap Editor Setup

Your Topics feature now has a **production-grade rich text editor** with image upload, code highlighting, and content persistence.

---

## ✅ What's Installed

- ✔ TipTap editor framework
- ✔ StarterKit (bold, italic, headings, lists, blockquotes)
- ✔ CodeBlockLowlight (syntax-highlighted code blocks with 100+ languages)
- ✔ Image extension (insert/edit images in content)
- ✔ Placeholder text for empty editor

---

## 🔧 Setup: Supabase Storage Bucket (Required)

### Step 1: Create the Public Bucket

Go to your Supabase Dashboard:

1. Navigate to **Storage** → click **Create a new bucket**
2. Name it: `topic-images`
3. Select **Public bucket** (check the box)
4. Click **Create bucket**

### Step 2: Create the Content Table (Required)

Run this SQL in your Supabase SQL editor (copy from `migrations/2026-02-20_add_topic_content_table.sql`):

```sql
CREATE TABLE IF NOT EXISTS practice_topic_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL UNIQUE REFERENCES practice_topics(id) ON DELETE CASCADE,
  content TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_practice_topic_content_topic ON practice_topic_content(topic_id);
```

After running:
- The table is created
- When you save content, it will upsert into this table
- Content persists across sessions

---

## 📚 Features

### Admin Editing

When logged in as an admin visiting a topic page:

1. **Rich Text Toolbar** (via TipTap keyboard shortcuts)
   - **Ctrl+B** → Bold
   - **Ctrl+I** → Italic
   - **Ctrl+Alt+C** → Code block
   - **#** prefix → Headings (# H1, ## H2, etc.)
   - **-** or **1.** → Lists

2. **Add Image Button**
   - Uploads image to Supabase Storage → `topic-images/topics/{topicId}/{timestamp}-filename.jpg`
   - Returns public URL
   - Inserts image into editor at cursor position
   - Images are persistent (not deleted with topic by default)

3. **Save Button**
   - Saves HTML-formatted content to `practice_topic_content.content`
   - Shows "Saving…" while request is in-flight
   - Auto-disabled during save to prevent duplicate requests

### Student Viewing

When logged in as a student (non-admin):

- Topic page shows **read-only** rich content
- Cannot edit or upload images
- Clean, formatted reading experience

### Public Viewing

When not logged in:

- May be able to see topics (depends on folder permissions)
- Content is **read-only**

---

## 🐛 Troubleshooting

### "Failed to upload image"

**Cause:** Storage bucket not public or doesn't exist

**Fix:**
1. Go to Supabase Storage
2. Click `topic-images` bucket
3. Click the ⚙️ settings icon
4. Ensure "Make this bucket public" is checked

### "Failed to save content"

**Cause:** `practice_topic_content` table doesn't exist

**Fix:**
1. Copy the SQL from `migrations/2026-02-20_add_topic_content_table.sql`
2. Paste into Supabase SQL editor
3. Click **Run**

### Content not loading

**Cause:** Supabase RLS (Row Level Security) policies may block reads

**Fix:**
1. Go to Supabase → Authentication → Policies
2. For `practice_topic_content`: Create a policy allowing authenticated users to select/insert/update/delete their own content
3. Or disable RLS temporarily for testing

---

## 📝 Component Details

### TopicContent.tsx

- **Client component** that handles editing
- Uses `useEditor()` hook to manage TipTap state
- Provides image upload via Supabase Storage
- Saves content as HTML to database
- Shows editor formatting tips for admins

### uploadTopicImage.ts

- Utility function to upload files to Supabase Storage
- Path structure: `topics/{topicId}/{timestamp}-{filename}`
- Returns public URL immediately after upload

### API (route.ts)

- **GET /api/topics** - fetch all topics for a folder
- **POST /api/topics** - create new topic
- **PUT /api/topics** - update topic name/slug
- **DELETE /api/topics** - delete topic (cascades: deletes questions & content)

---

## 🎨 Styling

The editor is themed with:

- Dark background (`bg-[#070707]`)
- Purple accent buttons (blue for image, purple for save)
- Prose styling for readable content layout
- Responsive design

Customization: Edit `TopicContent.tsx` className values.

---

## 🚀 Next Steps

All core functionality is complete! Optional enhancements:

1. **Auto-save** - Save content every 2 seconds
2. **Markdown Import/Export** - Support markdown format
3. **Table Support** - Add `@tiptap/extension-table`
4. **Mention/Hashtag** - @user or #tag suggestions
5. **Comments/Highlights** - Collaborative editing-style comments
6. **Undo History Indicator** - Show how many changes can be undone

---

## ✨ Result

Your Topics feature now feels like:
- 📘 W3Schools
- 📘 MDN Web Docs
- 📱 Notion
- 📚 Medium

Students can learn from beautifully formatted content with images, code samples, and rich text.
