import argparse
import json
import os
import sys
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from datetime import datetime, timezone

DATE_FORMATS = {
    'MM/DD': '%m/%d',
    'DD/MM': '%d/%m',
    'YYYY-MM-DD': '%Y-%m-%d',
    'DD MMM': '%d %b',
    'MMM DD': '%b %d',
}

def main():
    parser = argparse.ArgumentParser(description='Fetch Google Tasks')
    parser.add_argument('--token', required=True, help='Path to token.json')
    parser.add_argument('--date-format', default='MM/DD', help='Date display format')
    args = parser.parse_args()

    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'tasks_data.json')

    with open(args.token) as f:
        token_data = json.load(f)

    creds = Credentials(
        token=token_data['token'],
        refresh_token=token_data['refresh_token'],
        token_uri=token_data['token_uri'],
        client_id=token_data['client_id'],
        client_secret=token_data['client_secret'],
        scopes=token_data['scopes']
    )

    service = build('tasks', 'v1', credentials=creds)

    lists_result = service.tasklists().list().execute()
    task_lists = lists_result.get('items', [])

    active = []
    backlog = []
    now = datetime.now(timezone.utc)
    strftime_fmt = DATE_FORMATS.get(args.date_format, '%m/%d')

    for tlist in task_lists:
        tasks_result = service.tasks().list(
            tasklist=tlist['id'],
            showCompleted=False,
            showHidden=False
        ).execute()
        tasks = tasks_result.get('items', [])
        for task in tasks:
            title = task.get('title', '').strip()
            if not title:
                continue
            due = task.get('due')
            if due:
                due_dt = datetime.fromisoformat(due.replace('Z', '+00:00'))
                overdue = due_dt <= now
                due_str = due_dt.strftime(strftime_fmt)
                if overdue or due_dt.date() == now.date():
                    active.append({'title': title, 'due': due_str, 'overdue': overdue})
                else:
                    backlog.append({'title': title, 'due': due_str, 'overdue': False})
            else:
                backlog.append({'title': title, 'due': None, 'overdue': False})

    result = {'active': active, 'backlog': backlog}

    with open(output_path, 'w') as f:
        json.dump(result, f)

    print('Tasks:', json.dumps(result, indent=2))

if __name__ == '__main__':
    main()
