# Contributing

## How do I... <a name="toc"></a>

- [Use This Guide](#introduction)?
- Ask or Say Something? 🤔🐛😱
  - [Report an Error or Bug](#report-an-error-or-bug)
  - [Request a new example or extension to an existing template](#request-a-new-example-or-extension-to-an-existing-template)
- Make Something? 🤓👩🏽‍💻📜🍳
  - [Project Setup](#project-setup)
  - [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
  - [Contribute Code](#contribute-code)

## Introduction

Thank you so much for your interest in contributing! All types of contributions are encouraged and valued. See the [table of contents](#toc) for different ways to help and details about how this project handles them!📝

Please make sure to read the relevant section before making your contribution! It will make it a lot easier for us maintainers to make the most of it and smooth out the experience for all involved. 💚

The Project Team looks forward to your contributions. 🙌🏾✨

## Report an Error or Bug

If you run into an error or bug with the project:

- Open an Issue at https://github.com/grafana/grafana-plugin-examples/issues
- Include _reproduction steps_ that someone else can follow to recreate the bug or error on their own.
- Provide project and platform versions (nodejs, npm, etc), depending on what seems relevant. If not, please be ready to provide that information if maintainers ask for it.

Once it's filed:

- The project team will label the issue.
- A team member will try to reproduce the issue with your provided steps. If there are no repro steps or no obvious way to reproduce the issue, the team will ask you for those steps. Bugs will not be addressed until they are reproduced.
- If the team is able to reproduce the issue it will be left to be [implemented by someone](#contribute-code).
- If you or the maintainers don't respond to an issue for 30 days, the issue will be closed. If you want to come back to it, reply (once, please), and we'll reopen the existing issue. Please avoid filing new issues as extensions of one you already made.

## Request a new example or extension to an existing template

If our examples don't cover your use case and you would like to see a new template project available:

- Open an Issue at https://github.com/grafana/grafana-plugin-examples/issues
- Provide as much context as you can about what you are trying to do.
- Please indicate whether it should be incorporated within an existing template or a new example.

Once it's filed:

- The project team will label the issue.
- The project team will evaluate the feature request, possibly asking you more questions to understand its purpose and any relevant requirements. If the issue is closed, the team will convey their reasoning and suggest an alternative path forward.
- If the feature request is accepted it can then be worked on by either a core team member or by anyone in the community who wants to [contribute code](#contribute-code).

Note: The team is unlikely to be able to accept every single feature request that is filed. Please understand if they need to say no.

## Project Setup

So you wanna contribute some code! That's great! This project uses GitHub Pull Requests to manage contributions, so [read up on how to fork a GitHub project and file a PR](https://guides.github.com/activities/forking) if you've never done it before.

If this seems like a lot or you aren't able to do all this setup, you might also be able to [edit the files directly](https://help.github.com/articles/editing-files-in-another-user-s-repository/) without having to do any of this setup. Yes, [even code](#contribute-code).

If you want to go the usual route and run the project locally, though:

- [Install Node.js](https://nodejs.org/en/download/)
- [Fork the project](https://guides.github.com/activities/forking/#fork)

Then in your terminal:

- `cd path/to/your/clone/examples/<example_directory>`
- `npm install`
- `npm dev`
- `mage build:backend` (if the plugin has a backend)
- `docker compose up --build`

And you should be ready to go!

> [!NOTE]
> This repository is a collection of Grafana plugins with their own dependency lock files, dev environments, etc. That is to say it is not a monorepo in the traditional sense. To develop against a plugin you must navigate inside it's directory and run the above commands for each example you would like to contribute to.

## Contributor License Agreement (CLA)

Before we can accept your pull request, you need to [sign our CLA](https://grafana.com/docs/grafana/latest/developers/cla/). If you haven't, our CLA assistant prompts you to when you create your pull request.

## Contribute Code

We like code commits a lot! They're super handy, and they keep the project going and doing the work it needs to do to be useful to others. Before considering contributing code please review [report an error or bug](#report-an-error-or-bug) and [request a new example](#request-a-new-example-or-extension-to-an-existing-template) to make sure an issue has been filed and discussed with the project maintainers. PRs submitted without associated issues risk being closed or rejected.

Code contributions of just about any size are acceptable!

The main difference between code contributions and documentation contributions is that contributing code requires inclusion of relevant tests for the code being added or changed. Contributions without accompanying tests will be held off until a test is added, unless the maintainers consider the specific tests to be either impossible, or way too much of a burden for such a contribution.

To contribute code:

- [Set up the project](#project-setup).
- Make any necessary changes to the source code.
- Include any [additional documentation](#contribute-documentation) the changes might need.
- Write tests that verify that your contribution works as expected.
- Go to https://github.com/grafana/grafana-plugin-examples/pulls and open a new pull request with your changes.
- If your PR is connected to an open issue, add a line in your PR's description that says `Fixes: #123`, where `#123` is the number of the issue you're fixing.

Once you've filed the PR:

- Barring special circumstances, maintainers will not review PRs until all checks pass (Travis, AppVeyor, etc).
- One or more maintainers will use GitHub's review feature to review your PR.
- If the maintainer asks for any changes, edit your changes, push, and ask for another review. Additional tags (such as `needs-tests`) will be added depending on the review.
- If the maintainer decides to pass on your PR, they will thank you for the contribution and explain why they won't be accepting the changes. That's ok! We still really appreciate you taking the time to do it, and we don't take that lightly. 💚
- If your PR gets accepted, it will be marked as such, and merged into the `main` branch soon after.
