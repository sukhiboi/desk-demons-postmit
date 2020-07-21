# Contributing guidelines

Welcome Contributors.\
We request you to read all guidelines before contributing.

## Table of Contents

- [Prerequisites](#Prerequisites)
- [Project Skeleton](#Project-Skeleton)
- [Setup for development](#Setup-for-development)
- [Contribution](#Contribution)

<h4 id="Prerequisites"> Prerequisites </h4>

> _You just need to be aware of using below things._

- HTML and CSS
- NodeJs
- ExpressJs
- Sqlite
- Mocha
- Supertest

> _You just these packages with latest version._

- Node (version v12.18.2)
- Npm (version 6.14.5)

> _To check which version you have currently run this code._

1.  To get node version

```bash
$ node -v
    or
$ node --version
```

2.  To get npm version

```bash
$ npm -v
    or
$ npm --version
```

> _Update to latest if you don't have._

<h4 id="Project-Skeleton"> Project Skeleton </h4>

> _Please follow this project skeleton._

```
.
├── .eslintrc.json
├── .gitignore
├── README.md
├── bin
│   └── setup.sh*
├── lib\
│   └── handlers.js
├── package-lock.json
├── package.json
├── public
│   ├── styles\
│   ├── index.html
│   └── js\
├── server.js
└── test\
```

<h4 id="Setup-for-development"> Setup for development </h4>

> _To contribute for this project you need to do the following things._

1.  clone the repository

```
$ git clone https://github.com/sukhiboi/desk-demons-postmit.git
```

2.  Run this commands to get setup ready before you start contributing

```bash
$ sh bin/setup.sh
    or
$ npm run setup
```

<h4 id="Contribution"> Contribution </h4>

> _After preparing development environment._

1. Select an issue that you want to work on.
2. Get the information about that issue form BA.
3. make sure you got full clarity about the issue and then assign it to yourself.
4. As a pair follow `TDD` write tests to cover every line of code you added.
5. And make sure you run `git pull --rebase` or `git pull -r` before you are going to push the code. If you get any conflicts Talk with other team members and resolve them.
