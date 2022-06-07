#!/bin/bash

set -e
set +x

source .env

get_all_subwallets(){
    curl -s -X 'GET' \
    'http://localhost:8091/multitenancy/wallets' \
    -H 'accept: application/json' \
    -H "X-API-KEY: $AGENT_ADMIN_KEY"
}

create_new_wallet(){
    body="{ \"image_url\": \"$IMG_URL\", \"key_management_mode\": \"managed\", \"label\": \"$WALLET_NAME\", \"wallet_dispatch_type\": \"default\", \"wallet_key\": \"NotYetUsed\", \"wallet_name\": \"$WALLET_NAME\", \"wallet_type\": \"indy\", \"wallet_webhook_urls\": [ \"$BACKEND_URL:$WEBHOOK_PORT\" ] }"
    curl -s -X 'POST' \
    'http://localhost:8091/multitenancy/wallet' \
    -H 'accept: application/json' \
    -H "X-API-KEY: $AGENT_ADMIN_KEY" \
    -H 'Content-Type: application/json' \
    -d "$body"
}

create_private_did(){
    curl -s -X 'POST' \
    'http://localhost:8091/wallet/did/create' \
    -H 'accept: application/json' \
    -H "X-API-KEY: $AGENT_ADMIN_KEY" \
    -H "Authorization: Bearer $WALLET_TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{
  "method": "sov",
  "options": {
    "key_type": "ed25519"
  }
    }'
}

set_public_did(){
    curl -s -X 'POST' \
  "http://localhost:8091/wallet/did/public?did=$DID" \
  -H 'accept: application/json' \
    -H "X-API-KEY: $AGENT_ADMIN_KEY" \
    -H "Authorization: Bearer $WALLET_TOKEN" \
  -d ''
}

main(){
    
    echo "Current Subwallets: "
    echo $(get_all_subwallets)|jq
    echo
    
    echo "Creating New Wallet:"
    
    echo "Wallet Name: "
    read WALLET_NAME
    export WALLET_NAME
    
    echo "Webhook Port: "
    read WEBHOOK_PORT
    export WEBHOOK_PORT
    
    echo "Image Url: "
    read IMG_URL
    export IMG_URL
    
    new_subwallet=$(create_new_wallet)
    echo "$new_subwallet" | jq || (echo $new_did && exit 1)
    
    WALLET_ID=$(echo $new_subwallet | jq -r '.wallet_id')
    WALLET_TOKEN=$(echo $new_subwallet | jq -r '.token')
    export WALLET_TOKEN

    new_did=$(create_private_did)
    echo "$new_did" | jq || (echo $new_did && exit 1)
    DID=$(echo $new_did | jq -r '.result.did')
    export DID
    VERKEY=$(echo $new_did | jq -r '.result.verkey')

    echo
    echo "Please register this DID on the ledger now!"
    echo "Press Enter when done: "

    read ignored

    set_public_did=$(set_public_did)
    echo "$(set_public_did)" | jq || (echo $new_did && exit 1)

}




main $@


