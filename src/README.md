# Building the source code

The source code for the Leapwork GitHub Action is written in TypeScript using GitHub libraries, and is compiled into a single Javascript file using ````@vercel/ncc````.

You need Node.js version 16 or higher to build.

To build the javascript file, which resides in ````./dist/index.js```` simply run the following command:

* ````npm run build````

Then commit and push to GitHub, and finally add a version ````Tag```` and push that as well.

### Expanding or changing the source code

The current version of this Action very simply calls Leapwork's API to run a schedule, and creates an issue in GitHub with relevant details if at least one flow failed.

The logic can easily be extended with eg. configuration for whether to create issues, or fail the workflow, or output results for further processing by other GitHub Actions, or anything else desired.

### Further reading

* https://docs.github.com/actions
* https://docs.github.com/en/actions/creating-actions/about-custom-actions
* https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action
* https://octokit.github.io/rest.js/v18#issues-create
* https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions
* https://github.com/actions/toolkit/tree/main/packages/github
