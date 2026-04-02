# Service Reference

Complete reference for all 24 tools provided by the Google Workspace plugin.

---

## Authentication Tools (Always Available)

### `google_workspace_begin_auth`

Generate an OAuth authorization URL for all enabled services.

**Parameters:** None

**Example response:**
```
Google Workspace Authorization

Visit the following URL to authorize access:
https://accounts.google.com/o/oauth2/v2/auth?client_id=...

Enabled services: gmail, calendar, drive
Requested scopes: 4

After granting access, Google will show an authorization code.
Copy that code and run google_workspace_complete_auth with it.
```

---

### `google_workspace_complete_auth`

Exchange an authorization code for OAuth tokens.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `authorizationCode` | string | Yes | The code from the Google OAuth redirect |

**Example call:**
```json
{ "authorizationCode": "4/0AXY..." }
```

---

### `google_workspace_auth_status`

Check current authorization status across all services.

**Parameters:** None

**Reports:** Enabled services, token presence, scope gaps, read-only status per service.

---

## Gmail Tools

### `google_gmail_search`

Search messages using Gmail search syntax.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | Gmail search query |
| `maxResults` | integer | No | 20 | Max results (1-100) |

**Example queries:**
- `from:boss@company.com newer_than:1d`
- `subject:invoice has:attachment`
- `is:unread in:inbox`
- `to:me after:2026/03/01`

---

### `google_gmail_read`

Read full content of a specific email.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `messageId` | string | Yes | Gmail message ID |

---

### `google_gmail_list_unread`

List unread inbox messages.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `maxResults` | integer | No | 20 | Max results (1-100) |

---

### `google_gmail_list_by_label`

List messages by label.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `label` | string | Yes | — | Label name (INBOX, SENT, STARRED, etc.) |
| `maxResults` | integer | No | 20 | Max results (1-100) |

---

### `google_gmail_send`

Send an email. **Blocked in read-only mode.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Recipient email |
| `subject` | string | Yes | Subject line |
| `body` | string | Yes | Body text (plain text) |
| `cc` | string | No | CC recipients (comma-separated) |
| `bcc` | string | No | BCC recipients (comma-separated) |

---

## Calendar Tools

### `google_calendar_list_events`

List upcoming events.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `calendarId` | string | No | primary | Calendar ID |
| `windowDays` | integer | No | 7 | Days ahead (1-90) |
| `maxResults` | integer | No | 25 | Max events (1-100) |

---

### `google_calendar_create_event`

Create a calendar event. **Requires confirmation. Blocked in read-only mode.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `summary` | string | Yes | Event title |
| `start` | string | Yes | ISO 8601 datetime or YYYY-MM-DD for all-day |
| `end` | string | No | End time (defaults to start) |
| `timeZone` | string | No | IANA timezone |
| `location` | string | No | Event location |
| `description` | string | No | Event description |
| `attendees` | string[] | No | Attendee emails |
| `confirmed` | boolean | No | Set true after user confirms |

**Confirmation flow:** First call without `confirmed` shows a preview. Second call with `confirmed: true` creates the event.

---

### `google_calendar_update_event`

Update an existing event. **Requires confirmation. Blocked in read-only mode.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | string | Yes | Event ID to update |
| `summary` | string | No | New title |
| `start` | string | No | New start time |
| `end` | string | No | New end time |
| `timeZone` | string | No | IANA timezone |
| `location` | string | No | New location |
| `description` | string | No | New description |
| `confirmed` | boolean | No | Set true after user confirms |

---

### `google_calendar_delete_event`

Delete a calendar event. **Requires confirmation. Blocked in read-only mode.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventId` | string | Yes | Event ID to delete |
| `confirmed` | boolean | No | Set true after user confirms |

---

### `google_calendar_find_next_meeting`

Find the next meeting today.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `calendarId` | string | No | primary | Calendar ID |

---

## Drive Tools

### `google_drive_list_files`

List files in Drive.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `folderId` | string | No | root | Folder ID |
| `query` | string | No | — | Drive API query filter |
| `maxResults` | integer | No | 20 | Max files (1-100) |

---

### `google_drive_read_file`

Read file content. Google Docs export as text, Sheets as CSV. Binary files show metadata only.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fileId` | string | Yes | File ID |
| `exportMimeType` | string | No | Override export format |

---

### `google_drive_search`

Full-text search across Drive files.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | Search query |
| `maxResults` | integer | No | 20 | Max results (1-100) |

---

### `google_drive_create_file`

Create a new file. **Blocked in read-only mode.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | File name with extension |
| `content` | string | Yes | File content (text) |
| `mimeType` | string | No | MIME type (default: text/plain) |
| `parentFolderId` | string | No | Parent folder ID |

---

## Contacts Tools

### `google_contacts_search`

Search contacts by name or email.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | Yes | — | Search query |
| `maxResults` | integer | No | 10 | Max contacts (1-50) |

---

### `google_contacts_get`

Get a specific contact.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `resourceName` | string | Yes | Resource name (e.g., `people/c1234`) |

---

## Tasks Tools

### `google_tasks_list`

List tasks.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `taskListId` | string | No | default list | Task list ID |
| `showCompleted` | boolean | No | false | Include completed tasks |

---

### `google_tasks_create`

Create a new task.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `title` | string | Yes | Task title |
| `notes` | string | No | Task notes |
| `due` | string | No | Due date (ISO 8601) |
| `taskListId` | string | No | Task list ID |

---

### `google_tasks_complete`

Mark a task as completed.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `taskId` | string | Yes | Task ID |
| `taskListId` | string | No | Task list ID |

---

## Sheets Tools

### `google_sheets_read`

Read data from a spreadsheet.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spreadsheetId` | string | Yes | Spreadsheet ID (from URL) |
| `range` | string | Yes | A1 notation (e.g., `Sheet1!A1:D10`) |

---

### `google_sheets_write`

Write data to a spreadsheet. **Blocked in read-only mode.**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `spreadsheetId` | string | Yes | Spreadsheet ID |
| `range` | string | Yes | Target range (A1 notation) |
| `values` | string[][] | Yes | 2D array of values (rows × columns) |
