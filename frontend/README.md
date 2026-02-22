# Astro Help

Guide to working with git terminal and branches:
https://naitca-my.sharepoint.com/:w:/g/personal/hshaikh3_nait_ca/IQCsSTmlm5DjSJ7QC78svVzDAeAupT6dEIbndRoFWnfFW-M?e=IoyqwX 


Start with running: 
```sh
npm create astro@latest
```

To see your changes:
```sh
npm run dev
```

- Most of your work happens in /src

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src <MOST-IMPORTANT>
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

[our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview the `./dist/` folder locally             |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

[our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).


## Extensions
Download Astro extension (its like itellisense for Astro). May be helpful. 