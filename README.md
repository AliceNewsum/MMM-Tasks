# MMM-Tasks

A [MagicMirror²](https://magicmirror.builders/) module that fetches and displays your Google Tasks, automatically split into **active** (due today or overdue) and **backlog** (future/undated) sections.

Unlike other Google Tasks modules, MMM-Tasks prioritizes what needs your attention right now by separating tasks by due date. Overdue tasks are highlighted so nothing slips through the cracks.

![Screenshot](screenshot.jpg)

## Prerequisites

- A working MagicMirror² installation
- Python 3.6+ with `google-auth` and `google-api-python-client`
- A Google Cloud project with the **Google Tasks API** enabled
- An OAuth2 `token.json` file with your credentials

### Obtaining Google Tasks API credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (or select an existing one).
3. Navigate to **APIs & Services > Library**, search for **Tasks API**, and enable it.
4. Go to **APIs & Services > Credentials** and create an **OAuth 2.0 Client ID** (application type: Desktop app). Download the resulting `credentials.json`.
5. Use the `credentials.json` to run a one-time OAuth flow and generate a `token.json`. A minimal script to do this:

```python
from google_auth_oauthlib.flow import InstalledAppFlow

flow = InstalledAppFlow.from_client_secrets_file(
    'credentials.json',
    scopes=['https://www.googleapis.com/auth/tasks.readonly']
)
creds = flow.run_local_server(port=0)

import json
token_data = {
    'token': creds.token,
    'refresh_token': creds.refresh_token,
    'token_uri': creds.token_uri,
    'client_id': creds.client_id,
    'client_secret': creds.client_secret,
    'scopes': creds.scopes
}
with open('token.json', 'w') as f:
    json.dump(token_data, f)
print('token.json created')
```

6. Place the resulting `token.json` somewhere accessible on your MagicMirror host (e.g., `~/MagicMirror/config/token.json`).

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/MatthewNewsum/MMM-Tasks.git
pip3 install google-auth google-api-python-client
```

## Configuration

Add the following to your `config/config.js` modules array:

```javascript
{
    module: 'MMM-Tasks',
    position: 'top_left',
    config: {
        tokenPath: '/home/pi/MagicMirror/config/token.json',
        header: 'TO DO',
        maxTasks: 20,
        dateFormat: 'MM/DD',
        updateInterval: 10 * 60 * 1000
    }
}
```

## Config Options

| Option | Description | Default |
|--------|-------------|---------|
| `tokenPath` | Absolute path to your Google OAuth2 `token.json` file. | `'/home/pi/MagicMirror/config/token.json'` |
| `header` | Text displayed at the top of the module. | `'TO DO'` |
| `maxTasks` | Maximum number of tasks to display (active tasks are shown first). | `20` |
| `dateFormat` | Date format for due dates. Options: `MM/DD`, `DD/MM`, `YYYY-MM-DD`, `DD MMM`, `MMM DD`. | `'MM/DD'` |
| `updateInterval` | How often to fetch tasks from Google, in milliseconds. | `600000` (10 minutes) |

## How It Works

- **Active tasks**: Tasks that are due today or overdue. Overdue tasks are highlighted in amber.
- **Backlog tasks**: Tasks with a future due date or no due date at all.
- Active tasks are displayed first, followed by backlog tasks, up to the `maxTasks` limit.
- The module refreshes automatically at the configured `updateInterval`.

## License

MIT
