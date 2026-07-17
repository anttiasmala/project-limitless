# NOTE, THIS IS INFO ONLY FOR ME

How to be able to run "git push" in recently cloned repository (This is working only for me due to owner of repository)

1. You have to have a SSH key that is used in authentication.
2. Create a SSH key by running the following command: `ssh-keygen -t ed25519 -C "youremail@email.com"` **DON'T use `sudo`**.
   Go to: `https://github.com/settings/ssh/new` and add the text inside `id_ed25519.pub` to the Key section. The `ìd_ed25519.pub` file is located in `/home/USER/.ssh/`
3. Add the SSH key
4. Change remote's origin url to e.g. "git remote set-url origin git@github.com:anttiasmala/project-limitless.git"
5. Now `git push` should work

#

❯ ◯ @eslint/js ^9 → ^10
◯ @types/node ^24 → ^25
◯ eslint ^9 → ^10
◯ typescript ^6 → ^7

ESLint package is not updated due to ESLint 10 is too new for these packages eslint-config-next@16.2.6 ("eslint-plugin-import, eslint-plugin-jsx-a11y, eslint-plugin-react, eslint-plugin-react-hooks")

@types/node is left in ^24, currently using current stable version which is v24.15.0

typescript not updated to 7 yet, can be done later on
