This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# and
npx partykit dev
```

### Error while running SVGR (npm run svgr)

If you get this following error while running `npm run svgr`:

```
Failed to handle file: public/images/icons/contact-details.svg # NOTE, this is just an example .svg file
/project-limitless/node_modules/@svgr/cli/dist/index.js:435
throw error;
^

Error [ERR_REQUIRE_ESM]: require() of ES Module /project-limitless/node_modules/prettier-plugin-tailwindcss/dist/index.mjs not supported.
Instead change the require of /project-limitless/node_modules/prettier-plugin-tailwindcss/dist/index.mjs to a dynamic import() which is available in all CommonJS modules.
```

Head to `.prettierrc`file and remove the following line:`"plugins": ["prettier-plugin-tailwindcss"]`. Save the `.prettierrc`and try to run`npm run svgr` again. Now it should work. Remember to add the removed line back.
