# source this file, don't run it
# Specifies what ports to use when running the web app and backend services
# on localhost

# What port to use when running the web app dev server
export WEB_APP_DEV_SERVER_PORT=3000

# What port to use when running the web app production build
export WEB_APP_PORT=5000

# What port to use when running the API server
export API_SERVER_PORT=7000

# What port to use for the server that controls the API server
# This is used by end-to-end tests to make sure the app behaves
# correctly when the API server is unavaiable due to bugs or lack
# of internet connection (our web app works offline)
export API_SERVER_CONTROL_PORT=7100

# What port to use for the DynamoDB-local server
# This is an implementation detail of the API server but we have
# to care about that when running things locally
export DYNAMODB_LOCAL_PORT=9000
