# Full Setup — All Services Enabled

Complete configuration with all 6 Google Workspace services active.

## Prerequisites

Your Google Cloud project must have these APIs enabled:
- Gmail API
- Google Calendar API
- Google Drive API
- People API (for Contacts)
- Tasks API
- Google Sheets API

## 1. Install

```bash
openclaw plugins install @tensorfold/openclaw-google-workspace
```

## 2. Place credentials

```bash
mkdir -p ~/.openclaw/secrets
cp ~/Downloads/client_secret_*.json ~/.openclaw/secrets/google-oauth.json
chmod 600 ~/.openclaw/secrets/google-oauth.json
```

## 3. Add to `openclaw.json`

```json
{
  "plugins": {
    "allow": ["openclaw-google-workspace"],
    "entries": {
      "openclaw-google-workspace": {
        "enabled": true,
        "config": {
          "credentialsPath": "./secrets/google-oauth.json",
          "tokenPath": "./secrets/google-tokens.json",
          "services": {
            "gmail": {
              "enabled": true,
              "readOnly": false,
              "maxSearchResults": 20
            },
            "calendar": {
              "enabled": true,
              "readOnly": false,
              "defaultCalendarId": "primary",
              "defaultTimeZone": "America/New_York",
              "upcomingWindowDays": 7
            },
            "drive": {
              "enabled": true,
              "readOnly": false,
              "maxSearchResults": 20
            },
            "contacts": {
              "enabled": true,
              "maxSearchResults": 10
            },
            "tasks": {
              "enabled": true
            },
            "sheets": {
              "enabled": true,
              "readOnly": false
            }
          }
        }
      }
    }
  },
  "tools": {
    "allow": ["openclaw-google-workspace"]
  }
}
```

## 4. Restart and authorize

```bash
openclaw gateway restart
```

Authorize via chat — the OAuth URL will request scopes for all 6 services at once.

## 5. Verify each service

| Service | Test Command |
|---------|-------------|
| Gmail | "What's in my inbox?" |
| Calendar | "What's my next meeting?" |
| Drive | "List my recent Drive files" |
| Contacts | "Search contacts for John" |
| Tasks | "Show my task list" |
| Sheets | "Read cells A1:D10 from spreadsheet ID xyz" |

## Available Tools (24 total)

**Auth (3):** `google_workspace_begin_auth`, `google_workspace_complete_auth`, `google_workspace_auth_status`

**Gmail (5):** `google_gmail_search`, `google_gmail_read`, `google_gmail_list_unread`, `google_gmail_list_by_label`, `google_gmail_send`

**Calendar (5):** `google_calendar_list_events`, `google_calendar_create_event`, `google_calendar_update_event`, `google_calendar_delete_event`, `google_calendar_find_next_meeting`

**Drive (4):** `google_drive_list_files`, `google_drive_read_file`, `google_drive_search`, `google_drive_create_file`

**Contacts (2):** `google_contacts_search`, `google_contacts_get`

**Tasks (3):** `google_tasks_list`, `google_tasks_create`, `google_tasks_complete`

**Sheets (2):** `google_sheets_read`, `google_sheets_write`
