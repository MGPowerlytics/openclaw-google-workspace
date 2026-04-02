# @tensorfold/openclaw-google-workspace

All-in-one Google Workspace plugin for [OpenClaw](https://openclaw.ai). One plugin, one OAuth flow, six Google services.

**Gmail** | **Calendar** | **Drive** | **Contacts** | **Tasks** | **Sheets**

## Why This Plugin

Setting up Google integrations in OpenClaw typically requires installing 3+ separate plugins, each with its own OAuth flow, token management, and configuration. This creates friction during client deployments:

- Multiple `openclaw plugins install` commands
- Separate OAuth authorization for each service
- Different config schemas that conflict
- No shared token management

**This plugin solves that.** One install, one OAuth flow, one config block. Services are toggled on/off with a boolean.

## Quick Start

### 1. Install

```bash
openclaw plugins install @tensorfold/openclaw-google-workspace
```

### 2. Set up Google Cloud (one-time)

Create a Google Cloud project with the APIs you need enabled, then download OAuth Desktop Client credentials. See [docs/google-cloud-setup.md](docs/google-cloud-setup.md) for the full walkthrough.

### 3. Place credentials

```bash
mkdir -p ~/.openclaw/secrets
cp client_secret_*.json ~/.openclaw/secrets/google-oauth.json
chmod 600 ~/.openclaw/secrets/google-oauth.json
```

### 4. Configure `openclaw.json`

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

### 5. Restart, authorize, use

```bash
openclaw gateway restart
```

Then via your chat channel:

> "Run google_workspace_begin_auth"
> *(click URL, sign in, grant consent, copy code)*
> "Run google_workspace_complete_auth with code 4/0AXY..."
> "What's in my inbox?"

## Configuration Reference

### Top-level Config

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `credentialsPath` | string | Yes | Path to Google OAuth client credentials JSON |
| `tokenPath` | string | Yes | Path where OAuth tokens are stored |
| `oauthRedirectUri` | string | No | Override redirect URI (defaults to credentials file value) |
| `services` | object | No | Per-service configuration (see below) |

### Service Configuration

| Service | Default Enabled | Default ReadOnly | Properties |
|---------|:-:|:-:|---|
| `gmail` | true | false | `enabled`, `readOnly`, `maxSearchResults` |
| `calendar` | true | false | `enabled`, `readOnly`, `defaultCalendarId`, `defaultTimeZone`, `upcomingWindowDays` |
| `drive` | true | **true** | `enabled`, `readOnly`, `maxSearchResults` |
| `contacts` | **false** | — | `enabled`, `maxSearchResults` |
| `tasks` | **false** | — | `enabled` |
| `sheets` | **false** | true | `enabled`, `readOnly` |

### Environment Variable Overrides

All config properties can be overridden via environment variables:

| Variable | Overrides |
|----------|-----------|
| `GOOGLE_WORKSPACE_CREDENTIALS_PATH` | `credentialsPath` |
| `GOOGLE_WORKSPACE_TOKEN_PATH` | `tokenPath` |
| `GOOGLE_WORKSPACE_OAUTH_REDIRECT_URI` | `oauthRedirectUri` |
| `GOOGLE_WORKSPACE_GMAIL_ENABLED` | `services.gmail.enabled` |
| `GOOGLE_WORKSPACE_CALENDAR_ENABLED` | `services.calendar.enabled` |
| `GOOGLE_WORKSPACE_DRIVE_ENABLED` | `services.drive.enabled` |
| `GOOGLE_WORKSPACE_CONTACTS_ENABLED` | `services.contacts.enabled` |
| `GOOGLE_WORKSPACE_TASKS_ENABLED` | `services.tasks.enabled` |
| `GOOGLE_WORKSPACE_SHEETS_ENABLED` | `services.sheets.enabled` |

## Available Tools

### Authentication (3 tools — always available)

| Tool | Description |
|------|-------------|
| `google_workspace_begin_auth` | Generate OAuth URL for all enabled services |
| `google_workspace_complete_auth` | Exchange authorization code for tokens |
| `google_workspace_auth_status` | Check auth state, enabled services, scope gaps |

### Gmail (5 tools)

| Tool | Description |
|------|-------------|
| `google_gmail_search` | Search messages using Gmail search syntax |
| `google_gmail_read` | Read a specific email by ID |
| `google_gmail_list_unread` | List unread inbox messages |
| `google_gmail_list_by_label` | List messages by label |
| `google_gmail_send` | Send an email (blocked in read-only mode) |

### Calendar (5 tools)

| Tool | Description |
|------|-------------|
| `google_calendar_list_events` | List upcoming events |
| `google_calendar_create_event` | Create event (requires confirmation) |
| `google_calendar_update_event` | Update event (requires confirmation) |
| `google_calendar_delete_event` | Delete event (requires confirmation) |
| `google_calendar_find_next_meeting` | Find next meeting today |

### Drive (4 tools)

| Tool | Description |
|------|-------------|
| `google_drive_list_files` | List files in a folder |
| `google_drive_read_file` | Read file content or metadata |
| `google_drive_search` | Full-text search across Drive |
| `google_drive_create_file` | Create a file (blocked in read-only mode) |

### Contacts (2 tools)

| Tool | Description |
|------|-------------|
| `google_contacts_search` | Search contacts by name/email |
| `google_contacts_get` | Get a specific contact |

### Tasks (3 tools)

| Tool | Description |
|------|-------------|
| `google_tasks_list` | List tasks |
| `google_tasks_create` | Create a task |
| `google_tasks_complete` | Mark task as completed |

### Sheets (2 tools)

| Tool | Description |
|------|-------------|
| `google_sheets_read` | Read data from a spreadsheet |
| `google_sheets_write` | Write data (blocked in read-only mode) |

## Authentication

All services share a single Google OAuth2 flow. Scopes are computed dynamically based on which services are enabled:

| Service | Read-Only Scope | Read-Write Scope |
|---------|----------------|-----------------|
| Gmail | `gmail.readonly` | `gmail.modify` + `gmail.send` |
| Calendar | `calendar.events.readonly` | `calendar.events` |
| Drive | `drive.readonly` | `drive.file` |
| Contacts | `contacts.readonly` | `contacts.readonly` |
| Tasks | `tasks.readonly` | `tasks` |
| Sheets | `spreadsheets.readonly` | `spreadsheets` |

**Token management:**
- Tokens stored securely with `chmod 600` permissions
- Auto-refresh when access token expires
- Incremental scope addition when enabling new services (`include_granted_scopes: true`)

**Adding services later:** Enable the service in config, restart gateway, run `begin_auth` again. The OAuth URL requests the new scopes while preserving existing grants.

## Coexistence with Other Plugins

This plugin uses **tool-based** Gmail integration (search, read, send on demand). It does **not** replace the `@mcinteerj/openclaw-gmail` **channel plugin** which provides inbound email polling and auto-replies. Both can be installed simultaneously — they use different tool names and serve different purposes.

Similarly, this plugin's calendar tools use the `google_calendar_*` prefix and will not conflict with the standalone `openclaw-google-calendar` plugin if both are installed.

## Migration from Existing Plugins

If you're currently using separate Gmail and Calendar plugins:

1. Install this plugin alongside existing ones
2. Verify it works with your Google account
3. Disable the old plugins in `openclaw.json` (`"enabled": false`)
4. Remove old plugins from `plugins.allow` and `tools.allow`
5. Restart gateway

## Documentation

- [Setup Guide](docs/setup-guide.md) — Step-by-step deployment for TensorFold setups
- [Google Cloud Setup](docs/google-cloud-setup.md) — GCP project and OAuth configuration
- [Service Reference](docs/service-reference.md) — All 24 tools with parameters and examples
- [Troubleshooting](docs/troubleshooting.md) — Common issues and solutions
- [Config Example](examples/openclaw.config.example.jsonc) — Full annotated config
- [Minimal Setup](examples/minimal-setup.md) — Gmail-only quickstart
- [Full Setup](examples/full-setup.md) — All services enabled

## Development

```bash
# Clone and install
git clone https://github.com/tensorfold/openclaw-google-workspace.git
cd openclaw-google-workspace
npm install

# Type check
npm run typecheck

# Local install for testing
openclaw plugins install .
```

## License

MIT - TensorFold
