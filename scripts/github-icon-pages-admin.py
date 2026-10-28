"""Manage the icon presentation's Pages deployment via existing Git credentials.
Never prints credentials. GitHub connector does not expose Pages or push-run reads.
"""
import json
import subprocess
import sys
import urllib.error
import urllib.request

result = subprocess.run(['git', 'credential', 'fill'], input='protocol=https\nhost=github.com\n\n', text=True, capture_output=True, check=True)
credential = dict(line.split('=', 1) for line in result.stdout.splitlines() if '=' in line)
base = 'https://api.github.com/repos/gorankomar/stitch-animations'

def request(path, method='GET', data=None):
    req = urllib.request.Request(base + path, method=method,
        data=json.dumps(data).encode() if data is not None else None,
        headers={'Authorization': 'Bearer ' + credential['password'], 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req) as response:
            return json.load(response) if response.status != 204 else {}
    except urllib.error.HTTPError as error:
        print('GitHub API HTTP', error.code, error.read().decode()[:400])
        raise SystemExit(1)

operation = sys.argv[1]
if operation == 'enable':
    data = request('/pages', 'POST', {'build_type': 'workflow'})
    print(json.dumps({key: data.get(key) for key in ['html_url', 'status', 'build_type']}))
elif operation == 'runs':
    data = request('/actions/runs?per_page=10')
    print(json.dumps([{key: run.get(key) for key in ['id', 'name', 'head_sha', 'status', 'conclusion', 'html_url']} for run in data['workflow_runs']], indent=2))
elif operation == 'pages':
    data = request('/pages')
    print(json.dumps({key: data.get(key) for key in ['html_url', 'status', 'build_type']}))
else:
    raise SystemExit('Expected enable, runs, or pages')
