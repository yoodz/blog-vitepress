echo "is netlify: $NETLIFY"
echo "in branch: $BRANCH"
echo "head: $HEAD"

if [ "$NETLIFY" != "true" ]
then
  echo "this script only runs in netlify, bye"
  exit 1
fi

if [ "$BRANCH" = "master" ] && [ "$HEAD" = "master" ]
then
  npm run build
else
  echo "this script only runs in targeting dev's PR deploy preview, bye"
fi