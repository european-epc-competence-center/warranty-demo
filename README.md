# SSI Based eBon and Warranty Demo


Story line: https://hackmd.io/@Echsecutor/ryrf4ODFK


# Setup

Create an `.env` file setting the variables like

```
AGENT_SEED=

AGENT_ADMIN_KEY=
JWT_SECRET=

AGENT_WALLET_NAME=AgentBaseWallet01
AGENT_WALLET_KEY=

AGENT_ADMIN_URL=http://aca-py-idunion:8091
AGENT_ENDPOINT_URL=

STORE_WEBHOOK_PORT=8080
MANUFACTURER_WEBHOOK_PORT=8081

CONTROLLER_PORT=80

STORE_SUBWALLET_NAME=VendorWalletName
MANUFACTURER_SUBWALLET_NAME=ManufacturerWalletName

```


## ACA-PY
### Version
This demo was developed and tested with ACA-PY version v0.7.3-rc0.

### Subwallets
The demo is run by leveraging aca-py's multitenancy mode, meaning that there is a "baseWallet" (for managing acapy and subwallets and basic settings) and two "subwallets" (for interacting as the entities "Vendor" and "Manufacturer"). For information regarding ACA-PY's multitenancy mode see https://github.com/hyperledger/aries-cloudagent-python/blob/main/Multitenancy.md .

In order to create the two mandatory subwallets (Vendor and Manufacturer), do the following steps:

#### 1. Open ACA-PY Swagger UI as Administrator
Open ACA-PY's swagger UI by using your administrator key as ```X-API-KEY``` header

#### 2. Create a subwallet for Vendor and Manufacturer:
Use the endpoint ``` POST: /multitenancy/wallet``` twice (once for Vendor and once for Manufacturer) and provide the required data.

Example for a local setup:
```
{
    "key_management_mode": "managed",
    "settings": {
    "wallet.type": "indy",
    "wallet.name": "VendorWalletName",
    "wallet.webhook_urls": [
        "http://host.docker.internal:7000"
    ],
    "wallet.dispatch_type": "default",
    "default_label": "Vendor",
    "wallet.id": "d896ce4a-1f00-444a-8325-aebb9bb869d8",
    "image_url": "http://192.168.178.128:4000/public/dealer.png"
    },
    "wallet_id": "d896ce4a-1f00-444a-8325-aebb9bb869d8",
    "updated_at": "2022-02-18T08:14:37.393301Z",
    "created_at": "2022-02-01T12:07:40.871973Z"
}

```

Please note:
- ```wallet.webhook_urls``` has to point to the app controller. The controller has to be able to differentiate between webhook calls from Vendor and Manufacturer Wallet by its ports. In the case of the currdent deployment on EECC Discovery Server, those ports are 8080 (Vendor) and 8081 (Manufacturer).
- ```image_url``` defines what kind of image is displayed to the wallet mobile application when connecting to this subwallet. Ensure, that the referenced images are available.

Update any wrong configured subwallet configuration parameters by using ```PUT /multitenancy/wallet/{wallet_id}```. You can obtain the ```wallet_id``` by using ``` GET: /wallet/did```

In order to use a subwallet (either Vendor or Manufacturer), use (as admin) the following endpoint in order to get an Bearer token, which has to be set as authorization header: ```POST /multitenancy/wallet/{wallet_id}/token```. The controller of the ACA-PY needs to decide which entity (Vendor wallet or Manufacturer wallet) to call when.

#### 3. Create DIDs for each subwallet
Use the following endpoint in order to create local DIDs for each subwallet: ```POST /wallet/did/create```.

#### 4. Write the created DIDs to the ledger
Use any kind of tools (e.g. Indy CLI) to post the created DIDs of the subwallets to the target ledger (e.g Indy, Sovrin).

#### 5. Assign the created DID for each subwallet as public DID:
Assign the created and to ledger posted DIDs as public wallet DID by using the endpoint ```POST /wallet/did/public```.
(Do it twice, once for Vendor wallet and once for Manufacturer wallet).



## Setup Images for subwallets:
curl -X PUT "http://localhost:8091/multitenancy/wallet/[SUBWALLET ID]" -H "X-API-KEY: [ACAPY ADMIN KEY]" -H "accept: application/json" -H "Content-Type: application/json" -d "{ \"image_url\": \"[URL TO YOUR PUBLIC AVAILABLE IMAGE]\"}"

## Credential Definition ID's:
- eBon Credential: CRED_DEF=F3psycaZSrEqHtd94MXcnu:3:CL:10074:eBon-bought-item
- Warranty Credential: CRED_DEF=2ZgY4zh1qMQiXuPBjJQXRs:3:CL:10075:product-warranty




# Contributing

Any contribution is welcome, e.g. documentation, [bug reports, feature request, issues](issues/), blog posts, tutorials, feature implementations, etc. You can contribute code or documentation through the standard GitHub pull request model.

[Please have a look at CONTRIBUTING.md](CONTRIBUTING.md) for details, in particular how and why you need to sign off commits.

# Code of Conduct

Be excellent to each other!

[See CODE_OF_CONDUCT.md for details.](CODE_OF_CONDUCT.md)

# License

Copyright 2020-2022 by all parties listed in the [NOTICE](NOTICE) file

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

<http://www.apache.org/licenses/LICENSE-2.0>

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
