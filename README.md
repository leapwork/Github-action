# leapwork-github-action

This GitHub Action is used to run Leapwork as part of a CI/CD process.

In your GitHub repo, create a ````.github/workflows/main.yml```` file with the following content:

```yaml
name: Test Leapwork Action
on:
  push:
    branches:
      - main

permissions: write-all

jobs:
  run-action:
    name: Test with Leapwork
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Call Leapwork GitHub Action
        uses: leapwork/Github-action@v1.0
        with:
          leapworkApiUrl: ${{ vars.LEAPWORK_API_URL }}
          leapworkApiKey: ${{ secrets.LEAPWORK_API_KEY }}
          leapworkSchedule: ${{ vars.LEAPWORK_SCHEDULE }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Reference to Actions must include a version number. Use the newest version of the action, which is ````@v1.5```` at the time of writing.

Then add environment variables:

* ````LEAPWORK_API_URL```` - your Leapwork controller REST API url, such as ````http://20.224.212.55:9001/api````
* ````LEAPWORK_SCHEDULE```` - the name of your Leapwork schedule

and secret:

* ````LEAPWORK_API_KEY```` - the API key to access the REST API, also referred to as the "Access Key"

Once you commit a change in your repo, the Leapwork GitHub Action will execute, running the schedule on the Controller provided. If something fails, an issue will be created in GitHub with relevant details.
