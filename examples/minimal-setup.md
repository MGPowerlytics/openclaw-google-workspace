# Minimal Setup — Gmail Only

The simplest possible configuration: just Gmail search and read.

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
            "gmail": { "enabled": true, "readOnly": true },
            "calendar": { "enabled": false },
            "drive": { "enabled": false }
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

Then via your chat channel:
1. Ask the agent to run `google_workspace_begin_auth`
2. Click the URL, sign in, grant consent
3. Copy the authorization code
4. Ask the agent to run `google_workspace_complete_auth` with the code

## 5. Test

- "What's in my inbox?"
- "Search my email for invoices from last week"
- "Read message ID xyz"
