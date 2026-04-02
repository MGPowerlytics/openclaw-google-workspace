# Google Cloud Project Setup

Step-by-step guide to create a Google Cloud project and OAuth credentials for the Google Workspace plugin.

## 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top > **New Project**
3. Name it (e.g., `lvrn-agent` or `openclaw-workspace`)
4. Click **Create**
5. Select the new project from the dropdown

## 2. Enable Required APIs

Go to **APIs & Services > Library** and enable each API you need:

| API | Required For |
|-----|-------------|
| **Gmail API** | Gmail tools |
| **Google Calendar API** | Calendar tools |
| **Google Drive API** | Drive tools |
| **People API** | Contacts tools |
| **Tasks API** | Tasks tools |
| **Google Sheets API** | Sheets tools |

Only enable the APIs for services you plan to use. You can always enable more later and re-authorize.

## 3. Configure OAuth Consent Screen

Go to **APIs & Services > OAuth consent screen**:

1. Select **External** user type (unless you have a Google Workspace org and want **Internal**)
2. Fill in:
   - **App name:** Your agent name (e.g., "Lex - LVRN Legal")
   - **User support email:** Your email
   - **Developer contact:** Your email
3. Click **Save and Continue**
4. **Scopes page:** Click **Add or Remove Scopes** and add the scopes for your services:
   - `https://www.googleapis.com/auth/gmail.modify`
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/calendar.events`
   - `https://www.googleapis.com/auth/drive.readonly` (or `drive.file`)
   - `https://www.googleapis.com/auth/contacts.readonly`
   - `https://www.googleapis.com/auth/tasks`
   - `https://www.googleapis.com/auth/spreadsheets`
5. Click **Save and Continue**
6. **Test users page:** Add the Google account email that will use the agent
   - **This is critical** — if the user is not listed as a test user, they will get a `403 access_denied` error during OAuth

## 4. Create OAuth Credentials

Go to **APIs & Services > Credentials**:

1. Click **+ Create Credentials > OAuth client ID**
2. Application type: **Desktop app**
3. Name: Anything descriptive (e.g., "OpenClaw Workspace Plugin")
4. Click **Create**
5. Click **Download JSON** on the confirmation dialog
6. Save the file (it will be named `client_secret_*.json`)

## 5. Place the Credentials File

```bash
# On the target machine (via SSH if remote):
mkdir -p ~/.openclaw/secrets
cp client_secret_*.json ~/.openclaw/secrets/google-oauth.json
chmod 600 ~/.openclaw/secrets/google-oauth.json
```

The plugin's `credentialsPath` config should point to this file.

## Important Notes

- **Test users are required** for apps in "Testing" publishing status. Without adding the user, OAuth will fail with 403.
- The consent screen can stay in "Testing" status — you do not need to publish or verify the app.
- Each test user must be a real Google account (not a group alias).
- You can add up to 100 test users.
- If you need more than 100 users or want to skip the test user requirement, you must publish and verify the app with Google.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `403 access_denied` | User not added as test user | Add their email in OAuth consent screen > Test users |
| `invalid_client` | Wrong credentials file | Ensure you downloaded the OAuth Desktop Client JSON, not a service account key |
| `redirect_uri_mismatch` | Redirect URI not matching | The plugin uses the first URI from the credentials file. Add `http://127.0.0.1` to authorized redirect URIs if needed |
| `API not enabled` | Forgot to enable an API | Go to APIs & Services > Library and enable the missing API |
