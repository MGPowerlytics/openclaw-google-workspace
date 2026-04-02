# Troubleshooting

Common issues and solutions for the Google Workspace plugin.

## Authentication Issues

### "No stored OAuth tokens found"

**Cause:** The plugin has not been authorized yet, or the token file is missing.

**Fix:** Run `google_workspace_begin_auth` to start the OAuth flow, then `google_workspace_complete_auth` with the authorization code.

---

### "The authorization code has expired or was already used"

**Cause:** Authorization codes are single-use and expire after ~10 minutes.

**Fix:** Run `google_workspace_begin_auth` again to get a fresh URL, complete the flow promptly, and use the new code.

---

### "Authentication expired or revoked"

**Cause:** The refresh token was revoked (user removed access in Google Account settings) or the token file was corrupted.

**Fix:** Delete the token file and re-authorize:
```bash
rm ~/.openclaw/secrets/google-tokens.json
# Then run begin_auth and complete_auth again
```

---

### "Insufficient permissions" / 403 error

**Cause:** The OAuth token is missing scopes needed for the requested service. This happens when you enable a new service after the initial auth.

**Fix:** Run `google_workspace_auth_status` to see which scopes are missing, then run `google_workspace_begin_auth` to re-authorize with the full scope set.

---

### "403 access_denied" during OAuth consent

**Cause:** The Google account is not listed as a test user in the OAuth consent screen.

**Fix:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) > APIs & Services > OAuth consent screen
2. Click **Test users** > **Add users**
3. Add the user's Google email address
4. Try the OAuth flow again

---

## Configuration Issues

### "invalid config: must NOT have additional properties"

**Cause:** The plugin config in `openclaw.json` contains properties not defined in the config schema.

**Fix:** Check your config against the schema. Common mistakes:
- Using `readOnlyMode` instead of `readOnly`
- Adding unsupported properties to a service block
- Typos in property names

The config schema uses `additionalProperties: false` at every level. Only use the exact properties listed in the [config example](../examples/openclaw.config.example.jsonc).

---

### "credentialsPath is required"

**Cause:** The plugin config is missing the path to the OAuth credentials file.

**Fix:** Add `credentialsPath` to your plugin config:
```json
"config": {
  "credentialsPath": "./secrets/google-oauth.json",
  "tokenPath": "./secrets/google-tokens.json"
}
```

Or set the environment variable: `GOOGLE_WORKSPACE_CREDENTIALS_PATH=./secrets/google-oauth.json`

---

### "Cannot read OAuth credentials file"

**Cause:** The credentials file doesn't exist at the configured path, or file permissions prevent reading it.

**Fix:**
1. Verify the file exists: `ls -la ~/.openclaw/secrets/google-oauth.json`
2. Check it's readable: `cat ~/.openclaw/secrets/google-oauth.json | head -1`
3. Ensure the path in config is relative to `~/.openclaw/` (not absolute)

---

### Plugin not loading / tools not appearing

**Causes:**
1. Plugin not in `plugins.allow` list
2. Plugin not in `tools.allow` list
3. Plugin not installed

**Fix checklist:**
```bash
# 1. Check plugin is installed
openclaw plugins list

# 2. Check openclaw.json has both:
#    plugins.allow: ["openclaw-google-workspace"]
#    tools.allow: ["openclaw-google-workspace"]

# 3. Restart gateway
openclaw gateway restart

# 4. Check logs
tail -50 ~/.openclaw/logs/gateway.log | grep -i workspace
```

---

## Service-Specific Issues

### "Read-only mode: cannot [action]"

**Cause:** The service is configured with `readOnly: true`.

**Fix:** Set `readOnly: false` in the service config and restart the gateway. Drive defaults to `readOnly: true` for safety.

---

### Gmail: "No messages found" when there should be results

**Causes:**
- Gmail search syntax error
- Searching the wrong account
- Messages are in Trash or Spam (not searched by default)

**Fix:** Try broader search queries. Use `in:anywhere` to include Trash/Spam. Run `google_workspace_auth_status` to confirm which account is authorized.

---

### Calendar: Events showing wrong times

**Cause:** Timezone mismatch between the user's location and the calendar default.

**Fix:** Set `defaultTimeZone` in the calendar service config:
```json
"calendar": {
  "enabled": true,
  "defaultTimeZone": "America/New_York"
}
```

---

### Drive: "File too large to read inline"

**Cause:** The file exceeds 1 MB. The plugin limits inline content to prevent context overflow.

**Fix:** This is expected behavior. For large files, access them via Google Drive directly. The tool still returns the file's metadata and link.

---

### Drive: "Binary file: cannot display inline"

**Cause:** The file is not a text-based format (images, PDFs, videos, etc.).

**Fix:** The plugin returns metadata and a link. For PDFs, consider using Google Docs' conversion feature. For images, the link allows direct viewing.

---

### Sheets: "Spreadsheet not found"

**Cause:** The spreadsheet ID is incorrect, or the authorized account doesn't have access.

**Fix:** Extract the spreadsheet ID from the URL: `docs.google.com/spreadsheets/d/{THIS_PART}/edit`. Ensure the Google account used during OAuth has at least Viewer access to the spreadsheet.

---

## Network Issues

### "Network error" / ECONNREFUSED / ETIMEDOUT

**Cause:** Cannot reach Google's API servers.

**Fix:**
1. Check internet connectivity: `curl -I https://www.googleapis.com`
2. Check if a proxy or firewall is blocking requests
3. If running via SSH/Tailscale, ensure the machine has outbound HTTPS access

---

### "Rate limit exceeded"

**Cause:** Too many API requests in a short period.

**Fix:** Wait a few minutes and try again. If this happens frequently, consider:
- Reducing `maxSearchResults` in config
- Spacing out batch operations
- Checking Google Cloud Console for quota usage

---

## Token Management

### Manually inspecting the token file

```bash
cat ~/.openclaw/secrets/google-tokens.json | python3 -m json.tool
```

Look for:
- `access_token` — short-lived (~1 hour)
- `refresh_token` — long-lived (used to get new access tokens)
- `scope` — space-separated list of authorized scopes
- `expiry_date` — when the access token expires

### Force re-authorization

```bash
rm ~/.openclaw/secrets/google-tokens.json
openclaw gateway restart
# Then run begin_auth + complete_auth
```
