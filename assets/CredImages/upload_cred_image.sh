#!/bin/bash

set -e

echo CRED_ID=${CRED_ID:=$1}
echo IMAGE_FILE=${IMAGE_FILE:=$2}
echo KEY_FILE=${KEY_FILE:=.key}

source "$KEY_FILE"


help(){
    echo
    echo "Usage:"
    echo "$0 CRED_ID IMAGE_FILE"
    echo -e "\t CRED_ID beeing the id of your credential definition."
    echo -e "\t IMAGE_FILE beeing the local path of the image to be used."
    echo
    echo "The API Key read from the KEY_FILE (currently '$KEY_FILE', can be specified as an environment variable) is sourced."
    echo "Specify API_KEY=... in this key file."
    echo
}


if [[ "$CRED_ID" == "" ]]; then
    echo "No credential ID given."
    help
    exit 1
fi

if [[ "$IMAGE_FILE" == "" ]]; then
    echo "No Image file given."
    help
    exit 1
fi

if [[ "$API_KEY" == "" ]]; then
    echo "No API key found."
    help
    exit 1
fi

echo "[...] uploading credential"

curl -v -X POST "https://routing.lissi.io/api/Image?credId=$CRED_ID" \
    -H "X-API-Key: $API_KEY" \
    -H 'Content-Type: multipart/form-data' \
    --form "file=@$IMAGE_FILE"

echo
echo "[OK]"
