#!/bin/bash

set +x
set -e

ALL_CONNECTIONS_FILE=all_connections

source .env

#SUB_WALLET_TOKEN=$SUB_WALLET_TOKEN_VENDOR
SUB_WALLET_TOKEN=$SUB_WALLET_TOKEN_BDR

curl -X 'GET' \
'http://localhost:8091/connections' \
-H 'accept: application/json' \
-H "X-API-KEY: $AGENT_ADMIN_KEY" \
-H "Authorization: Bearer $SUB_WALLET_TOKEN" \
> "$ALL_CONNECTIONS_FILE"


IDS=$(cat $ALL_CONNECTIONS_FILE | jq -r '.results | .[] | .connection_id')

for ID in $IDS; do
    curl -s -X 'DELETE' \
    "http://localhost:8091/connections/$ID" \
    -H 'accept: application/json' \
    -H "X-API-KEY: $AGENT_ADMIN_KEY" \
    -H "Authorization: Bearer $SUB_WALLET_TOKEN" \
    > /dev/null
    echo $ID Deleted
done

rm $ALL_CONNECTIONS_FILE