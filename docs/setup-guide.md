# TensorFold Setup Guide

Step-by-step workflow for TensorFold technicians deploying the Google Workspace plugin for a new client.

## Prerequisites

- SSH access to client machine (typically Mac Mini via Tailscale)
- OpenClaw installed and gateway running
- A Google Cloud project with required APIs enabled (see [google-cloud-setup.md](./google-cloud-setup.md))
- OAuth Desktop Client credentials JSON downloaded

## Deployment Steps

### Step 1: SSH into client machine

```bash
ssh selitta@100.x.x.x  # via Tailscale
```

### Step 2: Install the plugin

```bash
openclaw plugins install @tensorfold/openclaw-google-workspace
```

Verify installation:
```bash
openclaw plugins list
# Should show: openclaw-google-workspace
```

### Step 3: Place credentials securely

```bash
mkdir -p ~/.openclaw/secrets

# Copy the OAuth credentials JSON (transfer via scp or paste)
# IMPORTANT: Use chmod 600 for security
chmod 600 ~/.openclaw/secrets/google-oauth.json
```

### Step 4: Configure openclaw.json

Edit `~/.openclaw/openclaw.json` and add/merge:

```json
{
  "plugins": {
    "allow": ["openclaw-google-workspace", "openclaw-mem0", "telegram"],
    "entries": {
      "openclaw-google-workspace": {
        "enabled": true,
        "config": {
          "credentialsPath": "./secrets/google-oauth.json",
          "tokenPath": "./secrets/google-tokens.json",
          "services": {
            "gmail": { "enabled": true },
            "calendar": { "enabled": true },
            "drive": { "enabled": true, "readOnly": true }
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

Adjust services based on client needs. Common configurations:

| Client Role | Recommended Services |
|-------------|---------------------|
| Legal/BA | Gmail, Calendar, Drive (read-only) |
| Operations | Gmail, Calendar, Drive, Tasks |
| Finance | Gmail, Calendar, Sheets |
| Creative | Gmail, Calendar, Drive |
| Executive | Gmail, Calendar, Drive, Contacts |

### Step 5: Restart gateway

```bash
openclaw gateway stop && openclaw gateway start
```

Check logs for plugin loading:
```bash
tail -20 ~/.openclaw/logs/gateway.log
# Look for: "Loaded plugin: openclaw-google-workspace"
```

### Step 6: Run OAuth authorization

This part requires the client (or access to their Google account).

Via the client's Telegram bot or web UI:

1. Send: "Run google_workspace_begin_auth"
2. The agent returns an authorization URL
3. Client (or technician with access) clicks the URL
4. Signs in with the client's Google account
5. Grants consent for all requested scopes
6. Copies the authorization code from the redirect page
7. Send: "Run google_workspace_complete_auth with code XXXX"
8. Agent confirms: "Authorization successful!"

### Step 7: Verify each service

Test each enabled service:

```
"Check google_workspace_auth_status"
→ Should show all services authorized

"What's in my inbox?"
→ Tests Gmail

"What's my next meeting?"
→ Tests Calendar

"List my recent Drive files"
→ Tests Drive
```

### Step 8: Document and hand off

Add a note to the client's workspace `TOOLS.md`:

```markdown
## Google Workspace Integration
- **Plugin:** openclaw-google-workspace
- **Services:** Gmail, Calendar, Drive (read-only)
- **Authorized:** [date]
- **Google Account:** [email]
- **Credentials:** ~/.openclaw/secrets/google-oauth.json
- **Tokens:** ~/.openclaw/secrets/google-tokens.json
```

## Adding Services Later

If a client wants to enable additional services after initial setup:

1. Enable the API in Google Cloud Console (if not already)
2. Update `openclaw.json` — set the service's `enabled: true`
3. Restart gateway: `openclaw gateway restart`
4. Re-authorize: "Run google_workspace_begin_auth" (requests additional scopes)
5. Complete auth with the new code
6. Verify: "Check google_workspace_auth_status" — should show no missing scopes

## Common Issues During Setup

| Issue | Solution |
|-------|----------|
| Plugin not loading | Check `plugins.allow` includes `"openclaw-google-workspace"` |
| Config validation error | Ensure no extra properties in config (use `additionalProperties: false` schema) |
| 403 during OAuth | Add client's email as test user in GCP OAuth consent screen |
| Token exchange fails | Code expired — re-run `begin_auth` for a fresh URL |
| Tools not appearing | Add `"openclaw-google-workspace"` to `tools.allow` |
| Gateway won't start | Check `~/.openclaw/logs/gateway.err.log` for details |
