rm -rf node_modules
rm package-lock.json
npm install
git delete-tag v1.0.2
git cm "try again"
git push-tag v1.0.2