'use strict'

const config = require('./Config.js')

const DEMO_STATE = config.DEMO_STATE

const express = require('express')
const AcapyClient = require('./agent.js')
const { ACAPY_CLIENT_EVENTS } = require('./acapyConstants')

const agentAdminURL = process.env.AGENT_ADMIN_URL || 'http://localhost:8080'
const agentEndpointURL =
  process.env.AGENT_ENDPOINT_URL || 'http://6240-46-114-39-29.ngrok.io'
const agentAdminKey = process.env.AGENT_ADMIN_KEY || 'MyAdminKey'
const storeSubwalletName =
  process.env.STORE_SUBWALLET_NAME || 'VendorWalletName'
const manufacturerSubwalletName =
  process.env.MANUFACTURER_SUBWALLET_NAME || 'ManufacturerWalletName'
const bdrSubwalletName =
  process.env.BDR_MOCK_SUBWALLET_NAME || 'BDRWalletName'

let storeWebhookPort = process.env.STORE_WEBHOOK_PORT || 7000
if (!Number.isInteger(storeWebhookPort)) {
  storeWebhookPort = parseInt(storeWebhookPort)
}

let manufacturerWebhookPort = process.env.MANUFACTURER_WEBHOOK_PORT || 7001
if (!Number.isInteger(manufacturerWebhookPort)) {
  manufacturerWebhookPort = parseInt(manufacturerWebhookPort)
}

let bdrWebhookPort = process.env.BDR_WEBHOOK_PORT || 7002
if (!Number.isInteger(bdrWebhookPort)) {
  bdrWebhookPort = parseInt(bdrWebhookPort)
}


let controllerPort = process.env.CONTROLLER_PORT || 4000
if (!Number.isInteger(controllerPort)) {
  controllerPort = parseInt(controllerPort)
}

const BDR_ONLINE_ID_CRED_DEF_ID =
  process.env.BDR_ONLINE_ID_CRED_DEF_ID ||
  '8H87k9ddqnpBdPjzRJgvmw:3:CL:16271:Online ID'

console.log(`AGENT_ADMIN_URL=${agentAdminURL}`)
console.log(`AGENT_ENDPOINT_URL=${agentEndpointURL}`)
console.log(`AGENT_ADMIN_KEY=${agentAdminKey}`)
console.log(`STORE_SUBWALLET_NAME=${storeSubwalletName}`)
console.log(`STORE_WEBHOOK_PORT=${storeWebhookPort}`)
console.log(`MANFUCATURER_SUBWALLET_NAME=${manufacturerSubwalletName}`)
console.log(`MANUFACTURER_WEBHOOK_PORT=${manufacturerWebhookPort}`)
console.log(`BDR_MOCK_SUBWALLET_NAME=${bdrSubwalletName}`)
console.log(`BDR_MOCK_WEBHOOK_PORT=${bdrWebhookPort}`)
console.log(`CONTROLLER_PORT=${controllerPort}`)
console.log(`BDR_ONLINE_ID_CRED_DEF_ID=${BDR_ONLINE_ID_CRED_DEF_ID}`)

/*------------------- DEMO DATA START -----------------*/

const EBON_SCHEMA = {
  attributes: [
    'eBon-id',
    'date',
    'item-id',
    'item-name',
    'net-price-amount',
    'net-price-currency',
    'vat-percent',
    'location-id',
    'vendor-id',
    'vendor-name'
  ],
  schema_name: 'eBon-bought-item',
  schema_version: '1.1'
}

const PRODUCT_CERTIFICATE_SCHEMA = {
  attributes: [
    'warranty-id',
    'valid-through',
    'item-id',
    'item-name',
    'vendor-id',
    'vendor-name',
    'eBon-id',
    'claim-endpoint'
  ],
  schema_name: 'product-warranty',
  schema_version: '1.0'
}
let EBON_SCHEMA_ID
let EBON_CRED_DEF_ID
let PRODUCT_CERTIFICATE_SCHEMA_ID
let PRODUCT_CERTIFICATE_CRED_DEF_ID



const demoUserStates = []

const someEeccGtin = 4047111007715
const digitalLingDomainAndPath =
  'https://id.eecc.de'
/*------------------- DEMO DATA END -----------------*/

// ---------------------------- AGENT PREPARATION START ------------------------------

// Setup Store Agent
const acapyStore = new AcapyClient(
  'AcapyStore',
  agentAdminURL,
  agentEndpointURL,
  agentAdminKey,
  storeSubwalletName
)
acapyStore.listenOnWebhookPort(storeWebhookPort)
connectAgent(acapyStore)

// Setup Manufacturer Agent
const acapyManufacturer = new AcapyClient(
  'AcapyManufacturer',
  agentAdminURL,
  agentEndpointURL,
  agentAdminKey,
  manufacturerSubwalletName
)
acapyManufacturer.listenOnWebhookPort(manufacturerWebhookPort)
connectAgent(acapyManufacturer)

// Setup BDR Mock Agent
const acapyBDR = new AcapyClient(
  'AcapyBDR',
  agentAdminURL,
  agentEndpointURL,
  agentAdminKey,
  bdrSubwalletName
)
acapyBDR.listenOnWebhookPort(bdrWebhookPort)
connectAgent(acapyBDR)

acapyStore.on(ACAPY_CLIENT_EVENTS.CONNECTED, async () => {
  //Prepare Schemas and Credential Definitions for acapyStore
  console.log(
    `Preparing Schemas and Credential Definitions for ${acapyStore.agentName}`
  )
  try {
    ;[EBON_SCHEMA_ID, EBON_CRED_DEF_ID] = await prepareSchemaAndCredDef(
      EBON_SCHEMA,
      acapyStore
    )
    console.log(
      `Successfully prepared Schemas and Credential Definitions for ${acapyStore.agentName}`
    )
  } catch (error) {
    console.log(
      `error while preparing Schemas and Credential Definitions for ${acapyStore.agentName}: ${error}`
    )
  }
})

acapyManufacturer.on(ACAPY_CLIENT_EVENTS.CONNECTED, async () => {
  //Prepare Schemas and Credential Definitions for acapyManufacturer
  console.log(
    `Preparing Schemas and Credential Definitions for ${acapyManufacturer.agentName}`
  )
  try {
    ;[
      PRODUCT_CERTIFICATE_SCHEMA_ID,
      PRODUCT_CERTIFICATE_CRED_DEF_ID
    ] = await prepareSchemaAndCredDef(
      PRODUCT_CERTIFICATE_SCHEMA,
      acapyManufacturer
    )
    console.log(
      `Successfully prepared Schemas and Credential Definitions for ${acapyManufacturer.agentName}`
    )
  } catch (error) {
    console.log(
      `error while preparing Schemas and Credential Definitions for ${acapyStore.agentName}: ${error}`
    )
  }
})

// ---------------------------- AGENT PREPARATION END ------------------------------

// ---------------------------- DEMO FLOW START ------------------------------

// Issuance of Base ID from BDR Mock
acapyBDR.on(
  ACAPY_CLIENT_EVENTS.NEW_CONNECTION_ESTABLISHED,
  async connectionData => {
    console.log(
      `Acapy BDR: connection established: ${connectionData.connection_id}`
    )

    const responseDemoStateJson = getDemoUserState(connectionData.connection_id)
    if (!responseDemoStateJson) {
      console.log(
        'ERROR: Connection established with bdr by someone who is not known as Demo User'
      )
      return
    }


    setTimeout(async () => {
      try {
        const attributesToIssue = {
          'addressZipCode': '50674',
          'placeOfBirth': 'Germany',
          'addressCity': 'Cologne',
          'addressCountry': 'Germany',
          'addressStreet': 'Aaachener Strasse',
          'dateOfExpiry': '30092025',
          'firstName': 'Monika',
          'familyName': 'Musterfrau',
          'birthName': 'Musterperson',
          'dateOfBirth': '08081970',
          'documentType': 'ID',
          'academicTitle': 'Dr.',
          'nationality': 'German'
        }

        const credentialOffer = await acapyBDR.buildCredentialOffer(
          connectionData.connection_id,
          BDR_ONLINE_ID_CRED_DEF_ID,
          attributesToIssue
        )
        await acapyBDR.issueCredential(credentialOffer)
      } catch (error) {
        console.log(`Error while sending eID credential offer: ${error}`)
      }
    }, 5000)
  }
)

acapyBDR.on(ACAPY_CLIENT_EVENTS.CREDENTIAL_ISSUED, async connectionID => {
  console.log(`AcapyBDR: Issued Credential for connection ${connectionID}.`)

  const responseDemoStateJson = getDemoUserState(connectionID)
  if (!responseDemoStateJson) {
    console.log(
      'ERROR: Credential issued to someone who is not known as Demo User'
    )
    return
  }

  responseDemoStateJson.state = DEMO_STATE.ID_CREDENTIAL_OFFER_ACCEPTED;
})

acapyStore.on(
  ACAPY_CLIENT_EVENTS.NEW_CONNECTION_ESTABLISHED,
  async connectionData => {
    console.log(
      `Acapy Store: connection established: ${connectionData.connection_id}`
    )

    const responseDemoStateJson = getDemoUserState(connectionData.connection_id)
    if (!responseDemoStateJson) {
      console.log(
        'ERROR: Connection established with store by someone who is not known as Demo User'
      )
      return
    }

    responseDemoStateJson.state = DEMO_STATE.CONNECTION_ESTABLISHED_WITH_STORE

    setTimeout(async () => {
      try {
        const attributesToIssue = {
          'eBon-id': generateDigitalLink(['253', getRandomGdti('eBon')]),
          date: new Date().toISOString(),
          'item-id': 'https://id.eecc.de/01/04012345999990/10/20210401-A/21/XYZ-1234',
          'item-name': 'Screwdriver One',
          'net-price-amount': '42.23',
          'net-price-currency': 'EUR',
          'vat-percent': '19',
          'location-id': generateDigitalLink([
            '414',
            someEeccGtin,
            '254',
            'store1'
          ]),
          'vendor-id': generateDigitalLink(['417', someEeccGtin]),
          'vendor-name': 'Vendor'
        }

        const credentialOffer = await acapyStore.buildCredentialOffer(
          connectionData.connection_id,
          EBON_CRED_DEF_ID,
          attributesToIssue
        )
        await acapyStore.issueCredential(credentialOffer)
      } catch (error) {
        console.log(`Error while sending eBon credential offer: ${error}`)
      }
    }, 5000)
  }
)

acapyStore.on(ACAPY_CLIENT_EVENTS.CREDENTIAL_OFFER_SENT, connectionID => {
  console.log(
    `AcapyStore: sent Credential offer for connection ${connectionID}.`
  )

  const responseDemoStateJson = getDemoUserState(connectionID)
  if (!responseDemoStateJson) {
    console.log(
      'ERROR: Credential offer was sent to someone who is not known as Demo User'
    )
    return
  }

  responseDemoStateJson.state = DEMO_STATE.EBON_CREDENTIAL_OFFER_SENT_BY_STORE
})

acapyStore.on(ACAPY_CLIENT_EVENTS.CREDENTIAL_ISSUED, async connectionID => {
  console.log(`AcapyStore: Issued Credential for connection ${connectionID}.`)

  const responseDemoStateJson = getDemoUserState(connectionID)

  if (!responseDemoStateJson) {
    console.log(
      'ERROR: eBon Credential was issued to someone who is not known as Demo User'
    )
    return
  }

  //get connection invitation for manufacturer
  try {
    const manufacturerConnectionInvitation = await acapyManufacturer.getNewConnectionInvitation(
      responseDemoStateJson.data.demo_user_id
    )
    const manufacturerInvitationURL =
      manufacturerConnectionInvitation.invitation_url

    //build DIDComm URL
    const manufacturerInvitationUrlWithoutHost = manufacturerInvitationURL.substring(
      manufacturerInvitationURL.indexOf('?'),
      manufacturerInvitationURL.length
    )
    const manufacturerDidCommInvitation =
      'didcomm://aries_connection_invitation' +
      manufacturerInvitationUrlWithoutHost

    //Update state data
    responseDemoStateJson.data.manufacturer_connection_id =
      manufacturerConnectionInvitation.connection_id
    responseDemoStateJson.data.manufacturer_invitation_url = manufacturerDidCommInvitation
    responseDemoStateJson.state =
      DEMO_STATE.REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER
  } catch (error) {
    console.log(
      `Error while loading invitation from acapyManufacturer: ${error}.`
    )
  }
})

acapyManufacturer.on(
  ACAPY_CLIENT_EVENTS.NEW_CONNECTION_ESTABLISHED,
  async connectionData => {
    console.log(
      `Acapy Manufacturer: connection established: ${connectionData.connection_id}`
    )
    let responseDemoStateJson = getDemoUserState(connectionData.connection_id)

    if (!responseDemoStateJson) {
      console.log(
        'ERROR: Connection with manufacturer was established by someone who is not known as Demo User.'
      )
      return
    }

    responseDemoStateJson.state =
      DEMO_STATE.CONNECTION_ESTABLISHED_WITH_MANUFACTURER

    setTimeout(async () => {

      const proofRequest = await acapyManufacturer.buildCustomProofRequest(
        'eBon',
        responseDemoStateJson.data.manufacturer_connection_id,
        [
          'item-name',
          'item-id',
          'vendor-name',
          'vendor-id',
          'eBon-id',
          'date',
          'location-id'
        ],
        [{ cred_def_id: EBON_CRED_DEF_ID }]
      )

      await acapyManufacturer.sendProofRequest(proofRequest)
      responseDemoStateJson.state =
        DEMO_STATE.EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER
    }, 5000)
  }
)

acapyManufacturer.on(ACAPY_CLIENT_EVENTS.PRESENTATION_RECEIVED, async data => {
  console.log(
    `AcapyManufacturer: Presentation with exchangeID ${data.presentation_exchange_id} from connection ${data.connection_id} received.`
  )

  let responseDemoStateJson = getDemoUserState(data.connection_id)

  if (!responseDemoStateJson) {
    console.log(
      'ERROR: acapyManufacturer received presentation from someone who is not known as Demo User.'
    )
    return
  }

  if (
    responseDemoStateJson.state ===
    DEMO_STATE.ONLINE_ID_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER
  ) {
    responseDemoStateJson.state =
      DEMO_STATE.ONLINE_ID_PRESENTATION_SENT_TO_MANUFACTURER

    const result = await acapyManufacturer.validateCustomProof(
      data.presentation_exchange_id
    )
    //TODO: Check if verification was successfull (for Demo ok without explicit check)

    responseDemoStateJson.data.proofData = result
    responseDemoStateJson.state =
      DEMO_STATE.ONLINE_ID_PRESENTATION_VERIFIED_BY_MANUFACTURER
  } else if (
    responseDemoStateJson.state ===
    DEMO_STATE.PRODUCT_CERTIFICATE_REQUEST_SENT_FROM_MANUFACTURER
  ) {
    responseDemoStateJson.state =
      DEMO_STATE.PRODUCT_CERTIFICATE_PRESENTATION_SENT_TO_MANUFACTURER
    const result = await acapyManufacturer.validateCustomProof(
      data.presentation_exchange_id
    )
    //TODO: Check if verification was successfull (for Demo ok without explicit check)

    responseDemoStateJson.data.proofData = result
    responseDemoStateJson.state =
      DEMO_STATE.PRODUCT_CERTIFICATE_PRESENTATION_VERIFIED_BY_MANUFACTURER

      /*
    setTimeout(async () => {
      const proofRequest = await acapyManufacturer.buildCustomProofRequest(
        'BaseID',
        responseDemoStateJson.data.manufacturer_connection_id,
        [
          'firstName',
          'familyName',
          'addressStreet',
          'addressZipCode',
          'addressCity',
          'addressCountry'
        ],
        [{ cred_def_id: BDR_ONLINE_ID_CRED_DEF_ID }]
      )

      await acapyManufacturer.sendProofRequest(proofRequest)
      responseDemoStateJson.state =
        DEMO_STATE.ONLINE_ID_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER
    }, 5000)
    */
  } else if (
    responseDemoStateJson.state ===
    DEMO_STATE.EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER
  ) {
    let verificationResult
    try {
      responseDemoStateJson.state =
        DEMO_STATE.EBON_PRESENTATION_SENT_TO_MANUFACTURER
      verificationResult = await acapyManufacturer.validateProof(
        data.presentation_exchange_id
      )
      //TODO: Check if verification was successfull (for Demo ok without explicit check)  

      responseDemoStateJson.data.proofData = verificationResult
      responseDemoStateJson.state =
        DEMO_STATE.EBON_PRESENTATION_VERIFIED_BY_MANUFACTURER
    } catch (error) {
      console.log(
        `Error while trying to validate proof with exchange ID ${data.presentation_exchange_id} for agent ${acapyManufacturer.agentName}: ${error}`
      )
    }

    setTimeout(
      async verificationResult => {
        try {
          let validThrough = new Date(
            verificationResult['RequestedAttributes'].find(
              attrObject => attrObject['attr_name'] === 'date'
            )['attr_value']
          )
          validThrough.setFullYear(validThrough.getFullYear() + 2)

          //TODO:  update schema and set dynamic attributes (like current time stamp etc.) (also from eBon Credential)
          let warrantyId = generateDigitalLink([
            '253',
            getRandomGdti(data.connection_id)
          ])

          const attributesToIssue = {
            'warranty-id': warrantyId,
            'valid-through': validThrough,
            'item-id': verificationResult['RequestedAttributes'].find(
              attrObject => attrObject['attr_name'] === 'item-id'
            )['attr_value'],
            'item-name': verificationResult['RequestedAttributes'].find(
              attrObject => attrObject['attr_name'] === 'item-name'
            )['attr_value'],
            'vendor-id': verificationResult['RequestedAttributes'].find(
              attrObject => attrObject['attr_name'] === 'vendor-id'
            )['attr_value'],
            'vendor-name': verificationResult['RequestedAttributes'].find(
              attrObject => attrObject['attr_name'] === 'vendor-name'
            )['attr_value'],
            'eBon-id': verificationResult['RequestedAttributes'].find(
              attrObject => attrObject['attr_name'] === 'eBon-id'
            )['attr_value'],
            'claim-endpoint': "https://warranty-demo.ssi.eecc.de/api/claim_warranty/" + data.connection_id
          }

          const credentialOffer = await acapyManufacturer.buildCredentialOffer(
            data.connection_id,
            PRODUCT_CERTIFICATE_CRED_DEF_ID,
            attributesToIssue
          )
          await acapyManufacturer.issueCredential(credentialOffer)
          demoUserStates[responseDemoStateJson.data.demo_user_id].state =
            DEMO_STATE.PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_SENT_BY_MANUFACTURER
        } catch (error) {
          console.log(
            `Error while sending product certificate credential offer: ${error}`
          )
        }
      },
      5000,
      verificationResult
    )
  } else {
    console.log('Undefined state')
  }
})

acapyManufacturer.on(
  ACAPY_CLIENT_EVENTS.CREDENTIAL_ISSUED,
  async connectionID => {
    console.log(
      `${acapyManufacturer.agentName}: Issued Credential for connection ${connectionID}.`
    )

    let responseDemoStateJson = getDemoUserState(connectionID)

    if (!responseDemoStateJson) {
      console.log(
        'ERROR: acapyManufacturer received presentation from someone who is not known as Demo User.'
      )
      return
    }

    responseDemoStateJson.state =
      DEMO_STATE.PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_ACCEPTED
    responseDemoStateJson.data.nextState =
      DEMO_STATE.WARRANTY_CASE_FLOW_INITIATED_BY_USER
  }
)

// ---------------------------- DEMO FLOW END ------------------------------

// --------------------------- HELPER FUNCTIONS ----------------------------

// generateDigitalLing([ai1,id1, ai2,id2,...])
function generateDigitalLink(parameters) {
  let dl = digitalLingDomainAndPath
  let i = 0
  while (i + 1 < parameters.length) {
    dl += '/' + parameters[i] + '/' + parameters[i + 1]
    i += 2
  }
  return dl
}

function getRandomGdti(prefix) {
  return someEeccGtin + prefix + getRandomString(15 - prefix.length)
}

function getRandomString(amount) {
  var chars = ''
  var characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (let i = 0; i < amount; i++) {
    chars += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return chars
}

function getRandomNumber(amount) {
  let digits = ''
  for (let i = 0; i < amount; ++i) digits += Math.floor(Math.random() * 10)

  return digits
}

function getDemoUserState(connectionID) {
  //no ID given
  if (!connectionID) {
    return
  }

  //try get demoUserState by connectionID from store
  if (demoUserStates[connectionID]) {
    return demoUserStates[connectionID]
  }

  //could be connection ID of manufacturer
  for (var key in demoUserStates) {
    if (demoUserStates[key].data.manufacturer_connection_id === connectionID) {
      return demoUserStates[key]
    }
  }

  // could be connection ID of BDR Mock
  for (var key in demoUserStates) {
    if (demoUserStates[key].data.bdr_connection_id === connectionID) {
      return demoUserStates[key]
    }
  }

  //unknown demo user
  return
}

async function connectAgent(agent) {
  const intervalID = setInterval(
    async agent => {
      console.log(`Trying to connect to agent ${agent.agentName}...`)

      let connected = await agent.connect()

      if (connected) {
        clearInterval(intervalID)
        console.log(`Successfully conncetd to agent ${agent.agentName}.`)
      } else {
        console.log(
          `Unable to connect to agent ${agent.agentName}. Retrying in 2 seconds...`
        )
      }
    },
    2000,
    agent
  )
}

async function prepareSchemaAndCredDef(schema, agent) {
  if (!agent || !agent instanceof AcapyClient) {
    throw `Please provide an instance of AcapyClient.`
  }

  let schemaID = await agent.getSchemaIdByNameFromWallet(schema.schema_name)

  if (schemaID) {
    console.log(
      `Schema ${schema.schema_name} already exists in wallet and has ID ${schemaID}.`
    )
  } else {
    console.log(
      `Schema ${schema.schema_name} does not exist in wallet. Creating...`
    )

    if (!schema) throw 'SchemaName may not be null/undefined/empty'

    if (!schema.schema_name || schema.schema_name === '')
      throw 'No Schema Name given.'

    if (!schema.attributes || schema.attributes.length === 0)
      throw 'No Schema Attributes given.'

    if (!schema.schema_version || schema.schema_version === '')
      schema.schema_version = '1.0'

    schemaID = await agent.writeSchemaToLedger(schema)

    console.log(
      `Successfully created ${schema.schema_name} schema with schema ID ${schemaID}`
    )
  }

  let credDefId = await agent.getCredDefBySchemaIdFromWallet(schemaID)

  if (credDefId) {
    console.log(
      `CredDef for schema ${schema.schema_name} (${schemaID}) already exists in wallet and has ID ${credDefId}`
    )
  } else {
    console.log(
      `CredDef for schema ${schema.schema_name} does not exist in wallet. Creating...`
    )
    const credDef = {
      schema_id: schemaID,
      tag: `${schema.schema_name}`
    }

    credDefId = await agent.writeCredDefToLedger(credDef)

    console.log(
      `Successfully created CredDef for ${schema.schema_name} schema with credDef ID ${credDefId}`
    )
  }

  return [schemaID, credDefId]
}


async function send_ebon_proof_request(manufacturer_connection_id) {
  setTimeout(async () => {

    const proofRequest = await acapyManufacturer.buildCustomProofRequest(
      'Productcertificate and Error Description',
      manufacturer_connection_id,
      [
        'warranty-id',
        'valid-through',
        'item-id',
        'item-name',
        'vendor-id',
        'vendor-name',
        'eBon-id'
      ],
      [{ cred_def_id: PRODUCT_CERTIFICATE_CRED_DEF_ID }]
    )

    proofRequest['proof_request']['requested_attributes']['error-description'] = {
      name: 'Malfunction:',
      restrictions: []
    }

    await acapyManufacturer.sendProofRequest(proofRequest)
    demoUserStates[getDemoUserState(manufacturer_connection_id).data.demo_user_id].state = DEMO_STATE.PRODUCT_CERTIFICATE_REQUEST_SENT_FROM_MANUFACTURER

  }, 5000)

}
// --------------------------- HELPER FUNCTIONS FOR AGENT SETUP END ---------------------

//--------------------- FRONTEND CALLS START -----------------------------
const controllerApp = express()
controllerApp.disable('x-powered-by')

//deliver static assets
let publicPath = __dirname + '/../public'
// "/api" required because of nginx config
controllerApp.use('/api/public', express.static(publicPath)) //Serves resources from public folder

//enable CORS for Testing purposes
controllerApp.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

controllerApp.post('/api/setDemoState', async (req, res) => {
  const forceState = req.query.force

  const demoUserID = req.query.demo_user_id
  if (!demoUserID || demoUserID === '') {
    console.log('demo_user_id must not be empty.')
    res.status(500).send('demo_user_id must not be empty.')
    return
  }

  const nextState = req.query.nextState
  if (
    !forceState &&
    (!nextState ||
      nextState === '' ||
      !Object.keys(DEMO_STATE).includes(nextState))
  ) {
    console.log('nextState was empty or is not known')
    res.status(500).send('nextState was empty or is not known')
    return
  }

  const userStateResponseJson = getDemoUserState(demoUserID)
  if (!userStateResponseJson) {
    console.log(`Don't know demo user with id ${demoUserID}`)
    res.status(500).send(`Don't know demo user with id ${demoUserID}`)
    return
  }

  if (forceState) {
    userStateResponseJson.state = nextState
  } else if (nextState === DEMO_STATE.WARRANTY_CASE_FLOW_INITIATED_BY_USER) {
    //check if calling user is at proper state (one state earlier)
    //currently state can be only forwarer when user is in state PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_ACCEPTED
    if (
      !userStateResponseJson.state ===
      DEMO_STATE.PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_ACCEPTED
    ) {
      console.log(
        `Cannot go to state ${nextState}. User is at state ${userStateResponseJson.state}`
      )
      res
        .status(500)
        .send(
          `Cannot go to state ${nextState}. User is at state ${userStateResponseJson.state}`
        )
      return
    }

    userStateResponseJson.state = DEMO_STATE.WARRANTY_CASE_FLOW_INITIATED_BY_USER

    send_ebon_proof_request(userStateResponseJson.data.manufacturer_connection_id)

  } else if (
    nextState === DEMO_STATE.REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER
  ) {
    setTimeout(async () => {
      //get connection invitation for manufacturer
      try {
        const manufacturerConnectionInvitation = await acapyManufacturer.getNewConnectionInvitation(
          userStateResponseJson.data.demo_user_id
        )
        const manufacturerInvitationURL =
          manufacturerConnectionInvitation.invitation_url

        //build DIDComm URL
        const manufacturerInvitationUrlWithoutHost = manufacturerInvitationURL.substring(
          manufacturerInvitationURL.indexOf('?'),
          manufacturerInvitationURL.length
        )
        const manufacturerDidCommInvitation =
          'didcomm://aries_connection_invitation' +
          manufacturerInvitationUrlWithoutHost

        //Update state data
        userStateResponseJson.data.manufacturer_connection_id =
          manufacturerConnectionInvitation.connection_id
        userStateResponseJson.data.manufacturer_invitation_url = manufacturerDidCommInvitation
        userStateResponseJson.state =
          DEMO_STATE.REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER
      } catch (error) {
        console.log(
          `Error while loading invitation from acapyManufacturer: ${error}.`
        )
      }
    }, 5000)
  } else {
    console.log(
      `Cannot go to state ${nextState}. User is at state ${userStateResponseJson.state}`
    )
    res
      .status(400)
      .send(
        `Cannot go to state ${nextState}. User is at state ${userStateResponseJson.state}`
      )
    return
  }

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(userStateResponseJson))
})

controllerApp.get('/api/claim_warranty/:connection_id', async (req, res) => {
  const demoUserID = req.params.connection_id
  const userState = getDemoUserState(demoUserID)

  send_ebon_proof_request(userState.data.manufacturer_connection_id)

})

controllerApp.get('/api/getDemoState', async (req, res) => {
  const demoUserID = req.query.demo_user_id

  let responseDemoStateJson = {}

  if (
    !demoUserID ||
    demoUserID === '' ||
    !demoUserStates[demoUserID] ||
    !demoUserStates[demoUserID].state ||
    demoUserStates[demoUserID].state === DEMO_STATE.UNKNOWN
  ) {

    //No idea who is calling. -->Start Demo Flow from beginning

    //get connection invitation for store 

    let storeConnectionInvitation;

    try {
      storeConnectionInvitation = await acapyStore.getNewConnectionInvitation(demoUserID)
    } catch (error) {
      console.log(
        `Error while trying to get connection invitations for new Demo Flow: ${error}`
      )
    }

    if (!storeConnectionInvitation) {
      console.log('Did not retreive a store connection invitation.')
      res.status(500).send('Did not retreive a store connection invitation.')
      return
    }


    const storeInvitationURL = storeConnectionInvitation.invitation_url

    //build DIDComm URL for store
    const storeInvitationUrlWithoutHost = storeInvitationURL.substring(
      storeInvitationURL.indexOf('?'),
      storeInvitationURL.length
    )
    const storeDidCommInvitation =
      'didcomm://aries_connection_invitation' + storeInvitationUrlWithoutHost


    responseDemoStateJson = {
      state: DEMO_STATE.REQUESTED_CONNECTION_INVITATION_FROM_STORE_AND_BDR,
      data: {
        //connection ID of store connection will be used as demo user identifier
        demo_user_id: storeConnectionInvitation.connection_id,
        store_connection_id: storeConnectionInvitation.connection_id,
        store_invitation_url: storeDidCommInvitation
      }
    }



    demoUserStates[
      responseDemoStateJson.data.demo_user_id
    ] = responseDemoStateJson
    console.log(
      'Started Demo Flow for demo_user_id:' +
      storeConnectionInvitation.connection_id
    )

    //get connection invitation for BDR MOCK    
    let bdrConnectionInvitation;

    try {
      bdrConnectionInvitation = await acapyBDR.getNewConnectionInvitation(responseDemoStateJson.data.demo_user_id)
    } catch (error) {
      console.log(
        `Error while trying to get connection invitations for BDR: ${error}`
      )
    }

    //get invitation URL
    const bdrInvitationURL = bdrConnectionInvitation.invitation_url

    // build DIDComm URL 
    const bdrInvitationUrlWithoutHost = bdrInvitationURL.substring(
      bdrInvitationURL.indexOf('?'),
      bdrInvitationURL.length
    )

    const bdrDidCommInvitation =
      'didcomm://aries_connection_invitation' + bdrInvitationUrlWithoutHost


    //Update state data
    responseDemoStateJson.data.bdr_connection_id = bdrConnectionInvitation.connection_id;
    responseDemoStateJson.data.bdr_invitation_url = bdrDidCommInvitation;



  } else {
    // we know the demo user --> just (re)send the (probably because of webhooks) prepared data without state change.
    // Frontend needs to know what to do with it because all data including state will be returned.
    responseDemoStateJson = getDemoUserState(demoUserID)
    console.log(
      'Demo_user_id ' +
      demoUserID +
      ' is in state ' +
      responseDemoStateJson.state
    )
  }

  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(responseDemoStateJson))
})

//--------------------- FRONTEND CALLS END -----------------------------

if (!controllerPort) {
  throw 'Please provide a valid port for controller listening.'
}

controllerApp.listen(controllerPort, '0.0.0.0', () => {
  console.log(`Controller listening at http://localhost:${controllerPort}`)
})
