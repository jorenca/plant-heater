## How to deploy web UI to gh-pages

```bash
git branch --delete gh-pages
git checkout -b gh-pages

cd web-ui
npm run build
# move build/static folder to project root

git add ../static
git commit -m "Release latest version of web UI"
git push --set-upstream origin gh-pages --force
```