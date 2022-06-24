const axios = require("axios");
const EventEmitter = require('events');
const express = require("express");
const { ACAPY_CLIENT_EVENTS, ACAPY_ADMIN_PATHS, ACAPY_WEBHOOK_PATHS, ACAPY_WEBHOOK_STATES } = require("./acapyConstants")

class AcapyClient extends EventEmitter {

  constructor(agentName, adminURL, endpointURL, adminKey, subWalletName) {

    super();

    if (!adminURL) {
      throw "AdminURL must not be <null> or undefined.";
    }

    if (!endpointURL) {
      throw "EndpointURL must not be <null> or undefined.";
    }

    if (!adminKey) {
      console.log("WARNING: Not using adminKey for agent admin endpoint. Endpoint is not secure.")
    }

    if (!agentName) {
      console.log("WARNING: Not using an agentName for agent.")
    }

    this.agentName = agentName
    this.adminURL = adminURL;
    this.endpointURL = endpointURL;
    this.adminKey = adminKey;
    this.ready = false;
    this.subWalletName = subWalletName
    this.subWalletId = null;
    //this.walletKey = null //No need for wallet key, since it looks like acapy does not check it at the moment --> BUG @ ACAPY!
    this.jwt = null; // required for subwallets

    //Setup Axios for all request to ACA-PY
    this.axios = axios.create({
      baseURL: this.adminURL,
      timeout: 3000,
      ...(this.adminKey && { headers: { "X-API-KEY": this.adminKey } })
    });
  }

  throwIfAgentIsNotReady() {
    if (!this.ready) {
      throw 'Agent is not ready. Try to connect first.';
    }
  }

  async connect() {
    try {
      const res = await this.axios.get(ACAPY_ADMIN_PATHS.STATUS_READY);
      if (res.data.ready) {
        this.ready = true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(`Error while connecting to Agent ${this.agentName}.`, error.message)
      return false;
    }

    if (this.subWalletName) {
      //running in multi tenancy mode      
      await this.prepareSubwallet();
    } else {
      //Not running in multi tenancy mode. Use Base Wallet
      try {
        this.issuerDid = await this.fetchCurrentIssuerDid();
      } catch (error) {
        console.log("Error while fetching issuer DID.", error.message)
      }
    }

    this.emit(ACAPY_CLIENT_EVENTS.CONNECTED);
    return this.ready;
  }

  async prepareSubwallet() {
    try {
      console.log("Trying to load subwallet: " + this.subWalletName)
      let res = await this.axios.get(
        `/multitenancy/wallets?wallet_name=${this.subWalletName}`
      );

      const subWalletsThatMatch = res.data.results.filter(subwallet => subwallet.settings['wallet.name'] === this.subWalletName)

      if (subWalletsThatMatch.length === 0) {
        throw 'No subwallet with name ' + this.subWalletName + " found!";
      }

      const subwalletId = subWalletsThatMatch[0].settings['wallet.id'];

      if (!subwalletId) {
        throw 'Cannot determine id of subwallet';
      }

      this.subWalletId = subwalletId;
      console.log("Found subwalletID: " + this.subWalletId)

      res = await this.axios.post(
        `/multitenancy/wallet/${this.subWalletId}/token`
      );

      this.jwt = res.data.token;
      console.log(`Using JWT Token for subwallet ${this.subWalletName} (${this.subWalletId}): ${this.jwt}`);

      //set JWT for all request to ACA-PY since it is a Subwallet
      this.axios.defaults.headers.common['Authorization'] = `Bearer ${this.jwt}`;

      this.issuerDid = await this.fetchCurrentPublicDid();

      //TODO separate in different try catch blocks
    } catch (error) {
      console.log("Error while fetching Sub Wallets.", error.message)
    }
  }

  async fetchCurrentPublicDid() {
    let res = await this.axios.get(ACAPY_ADMIN_PATHS.WALLET_PUBLIC_DID)
    return res.data.result.did;
  }

  async validateCustomProof(presentation_exchange_id) {
    this.throwIfAgentIsNotReady()

    const res = await this.axios.post(
      `/present-proof/records/${presentation_exchange_id}/verify-presentation`
    );

    const revealed_attrs = res.data.presentation.requested_proof.revealed_attrs;
    const self_attested_attrs = res.data.presentation.requested_proof.self_attested_attrs;

    console.log(res.data.presentation.requested_proof)

    let result = []

    for (const [attrName, attrObject] of Object.entries(revealed_attrs)) {
      let element = {};
      element["attr_name"] = attrName;
      element["attr_value"] = revealed_attrs[attrName].raw;
      result.push(element);
    }

    for (const [attrName, attrObject] of Object.entries(self_attested_attrs)) {
      let element = {};
      element["attr_name"] = attrName;
      element["attr_value"] = attrObject;
      result.push(element);
    }

    //todo: check if verified
    return result;
  }

  async validateProof(presentation_exchange_id) {
    this.throwIfAgentIsNotReady()
    const res = await this.axios.post(
      `/present-proof/records/${presentation_exchange_id}/verify-presentation`
    );

    const attr_groups = res.data.presentation.requested_proof.revealed_attr_groups;

    let result = {}
    for (var groupName in attr_groups) {
      const group = attr_groups[groupName];
      result[groupName] = []
      for (var attrName in group.values) {
        let element = {}
        element["attr_name"] = attrName;
        element["attr_value"] = group.values[attrName].raw
        result[groupName].push(element);
      }
    }

    //TODO: check if verified
    return result;
  }

  async getNewConnectionInvitationUrl(label) {
    this.throwIfAgentIsNotReady()
    const connectionInvitation = await this.getNewConnectionInvitation(label);
    return connectionInvitation.invitation_url
  }

  async getNewConnectionInvitation(label) {
    this.throwIfAgentIsNotReady()

    const result = await this.axios.post(
      `${ACAPY_ADMIN_PATHS.CONNECTIONS_CREATE_INVITATION}?${label ? 'alias=' + label + '&' : ''}auto_accept=true`
    );

    return result.data;
  }

  async getAllConnections() {
    this.throwIfAgentIsNotReady()
    const res = await this.axios.get(ACAPY_ADMIN_PATHS.CONNECTIONS);

    return res.data;
  }

  async writeSchemaToLedger(schema) {
    this.throwIfAgentIsNotReady()
    const res = await this.axios.post(ACAPY_ADMIN_PATHS.SCHEMAS, schema).catch(error => {
      console.log("Error while creating Schema: " + error.response.statusText)
    });
    return res.data.schema_id
  }

  async writeCredDefToLedger(credDef) {
    this.throwIfAgentIsNotReady()
    const res = await this.axios.post(ACAPY_ADMIN_PATHS.CREDENTIAL_DEFINITIONS, credDef, { timeout: 20000 }).catch(error => {
      console.log("Error while creating Cred Def: " + error.response.statusText)
    })

    return res.data.credential_definition_id
  }

  async getLastCreatedConnectionID() {

    this.throwIfAgentIsNotReady()
    const res = await this.axios.get(ACAPY_ADMIN_PATHS.CONNECTIONS)

    const result = res.data.results.sort((a, b) => {
      return (new Date(b.created_at) - new Date(a.created_at))
    });

    return result[0].connection_id
  }

  async createConnectionlessProofRequest() {
    this.throwIfAgentIsNotReady()

    const schemaID = await this.getSchemaIdByNameFromWallet("Kaufbeleg")
    const credentialDefinitionID = await this.getCredDefBySchemaIdFromWallet(schemaID);

    let connectionlessProofRequestAcapy =
    {
      "proof_request": {
        "name": "Proof request",
        "requested_predicates": {},
        "requested_attributes": {
          "additionalProp1": {
            "name": "Kaufsache"
            // ",non_revoked": {
            //   "from": 1612375174,
            //   "to": 1612475174
            // }
            , restrictions: [
              { "cred_def_id": credentialDefinitionID },
            ],
          },
          "additionalProp2": {
            "name": "Kaufdatum"
            , restrictions: [
              { "cred_def_id": credentialDefinitionID },
            ],
          },
          "additionalProp3": {
            "name": "Kaufpreis"
            , restrictions: [
              { "cred_def_id": credentialDefinitionID },
            ],
          },
          "additionalProp4": {
            "name": "Kaufort"
            , restrictions: [
              { "cred_def_id": credentialDefinitionID },
            ],
          }
        },
        "version": "0.1",
        "nonce": "1234567890"
      },
      "comment": "string"
    }

    const result_proof_request = await this.axios.post(`/present-proof/create-request`, connectionlessProofRequestAcapy).catch(error => {
      console.log("Error while creating proof request: " + error.response.statusText)
    })

    const result_connection = await this.axios.post(
      `${ACAPY_ADMIN_PATHS.CONNECTIONS_CREATE_INVITATION}?auto_accept=true`
    );

    const verKey = await this.fetchCurrentIssuerVerkey();

    const result = {

      "@type": "did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/present-proof/1.0/request-presentation",
      "@id": result_proof_request.data.presentation_request_dict['@id'],
      "request_presentations~attach": result_proof_request.data.presentation_request_dict['request_presentations~attach'],
      "~service": {
        "recipientKeys": [verKey],
        "routingKeys": [],
        "serviceEndpoint": result_connection.data.invitation.serviceEndpoint
      }
      //thread seems to be not importend for aca-py (7.0)
      // ,"~thread":{
      //    "thid": result_proof_request.data.thread_id,
      //    "sender_order":0,
      //    "received_orders":{}
      // }
    }

    //console.log(util.inspect(result, false, null, true /* enable colors */))

    return Buffer.from(JSON.stringify(result)).toString('base64');
  }

  // expect attributes to be a list of strings with the attribute names
  async buildCustomProofRequest(proofRequestName, connectionID, attributes, restrictions) {
    this.throwIfAgentIsNotReady();

    if (!proofRequestName) {
      throw `Proof Request Name must not be empty!`
    }

    if (!connectionID) {
      throw `Connection ID must not be empty!`;
    }

    if (!attributes) {
      throw `Attributesmust not be empty!`;
    }

    let attributes2Request = {};

    attributes2Request['RequestedAttributes'] = {
        names: attributes,
        restrictions: restrictions
      }
    
    console.log("RequestedAttributes: " + attributes2Request);
      
    let proofRequestTemplate = {
      connection_id: connectionID,
      proof_request: {
        name: proofRequestName,
        version: "1.0",
        requested_attributes: attributes2Request,
        requested_predicates: {},
      },
      trace: false,
    };

    return proofRequestTemplate;
  }

  async buildProofRequest(credDefId, proofRequestName, connectionID) {
    this.throwIfAgentIsNotReady();

    if (!credDefId) {
      throw `Credential Definition must not be empty!`;
    }

    if (!proofRequestName) {
      throw `Proof Request Name must not be empty!`
    }

    if (!connectionID) {
      throw `Connection ID must not be empty!`;
    }

    const credentialDefinition = await this.getCredentialDefinitionByIdFromLedger(credDefId);
    const schema = await this.getSchemaByIdFromLedger(credentialDefinition.schemaId);

    let proofRequestTemplate = {
      connection_id: connectionID,
      proof_request: {
        name: proofRequestName,
        version: "1.0",
        requested_attributes: {},
        requested_predicates: {},
      },
      trace: false,
    };

    proofRequestTemplate.proof_request.requested_attributes[schema.name] =
    {
      names: schema.attrNames,
      restrictions: [
        { cred_def_id: credDefId }
      ]
    }

    return proofRequestTemplate;
  }

  async sendProofRequest(proofRequest) {

    if (!proofRequest) {
      throw `proofRequest must not be empty!`
    }

    this.throwIfAgentIsNotReady()
    const res = await this.axios.post(`/present-proof/send-request`, proofRequest).catch(error => {
      console.log("Error while asking for presentation: " + error.response.statusText)
    })
  }


  async askConnectionForPresentation(credDefID, connectionID) {

    let proofRequest = {
      connection_id: connectionID,
      proof_request: {
        name: "Anfrage Kaufbeleg",
        version: "1.0",
        requested_attributes: {
          "Kaufbeleg": {
            names: ["Kaufdatum", "Kaufort", "Kaufpreis", "Kaufsache"],
            restrictions: [
              { cred_def_id: credDefID },
            ],
          },
        },
        requested_predicates: {},
        // optional start
        //non_revoked: {
        //from: 0,
        // to: 1605730081,
        //},
        //optional end
      },
      trace: false,
    };

    this.throwIfAgentIsNotReady()
    const res = await this.axios.post(`/present-proof/send-request`, proofRequest).catch(error => {
      console.log("Error while asking for presentation: " + error.response.statusText)
    })
  }

  async fetchCurrentIssuerDid() {
    this.throwIfAgentIsNotReady()
    const res = await this.axios.get(ACAPY_ADMIN_PATHS.WALLET_PUBLIC_DID)

    this.issuerDid = res.data.result.did

    console.log("Current issuer Did: " + this.issuerDid);
  }

  async checkIfAgentHasCredDefInWallet(credDefId) {

    if (!credDefId || credDefId === "") {
      throw `CredDefId must not be empty!`;
    }

    this.throwIfAgentIsNotReady();

    const res = await this.axios.get(`${ACAPY_ADMIN_PATHS.CREDENTIAL_DEFINITIONS}/created?cred_def_id=${credDefId}`)

    if (res.data.credential_definition_ids.length <= 0) {
      return false;
    }

    return true;
  }

  async fetchCurrentIssuerVerkey() {
    this.throwIfAgentIsNotReady()
    const res = await this.axios.get(ACAPY_ADMIN_PATHS.WALLET_PUBLIC_DID)

    return res.data.result.verkey
  }

  async buildCredentialOffer(connectionID, credentialDefinitionID, attributes) {
    this.throwIfAgentIsNotReady();

    if (!connectionID || connectionID === "") {
      //TODO: Check if connection is in agent wallet
      throw "Connection ID must not be empty!";
    }

    if (!credentialDefinitionID || credentialDefinitionID === "") {
      throw "CredentialDefinitionID must not be empty!";
    }

    if (!attributes || Object.keys(attributes).length <= 0) {
      throw "attributes must not be empty!";
    }

    let credDef = await this.getCredentialDefinitionByIdFromLedger(credentialDefinitionID)
    if (!credDef) {
      throw `Cannot find Cred Def for CredDefID ${credentialDefinitionID}`;
    }

    if (!await this.checkIfAgentHasCredDefInWallet(credentialDefinitionID)) {
      throw `Cannot prepare Credential offer for ${credentialDefinitionID} because it credential definition is not in own wallet.`
    }

    let schemaID = credDef.schemaId;
    let schema = await this.getSchemaByIdFromLedger(schemaID);

    if (!schema) {
      throw `Cannot find Schema for CredDefID ${credentialDefinitionID} on ledger`;
    }

    let credentialOfferTemplate = {
      auto_remove: true,
      comment: "mycomment",
      connection_id: connectionID,
      cred_def_id: credentialDefinitionID,
      credential_proposal: {
        "@type": "issue-credential/1.0/credential-preview",

        attributes: [
          // {
          //   name: "Kaufort",
          //   value: "hier",
          // },
          // {
          //   name: "Kaufdatum",
          //   value: "heute",
          // },
          //...
        ],
      },
      issuer_did: this.issuerDid,
      //schema_id: schemaID,
      //schema_issuer_did: this.issuerDid, //TODO???
      //schema_name: schema.name,
      //schema_version: schema.version,
      trace: false,
    };

    let requiredAttrNames = schema.attrNames;

    requiredAttrNames.forEach((attrName) => {
      const attr = attributes[attrName];

      if (!attr) {
        throw `Error while creating CredentialOffer: Missing attribute ${attrName} in given attributes`;
      }

      credentialOfferTemplate.credential_proposal.attributes.push({ name: attrName, value: attributes[attrName] });

    });

    return credentialOfferTemplate;

  }

  async issueCredential(credentialOffer) {
    this.throwIfAgentIsNotReady();

    const res = await this.axios.post(ACAPY_ADMIN_PATHS.CREDENTIAL_ISSUE, credentialOffer).catch(error => {
      console.log("Error while issuing Credential: " + error.response.statusText)
    })

    return res.data;
  }

    async getCredentialDefinitionByIdFromLedger(credDefId) {
    this.throwIfAgentIsNotReady();

    credDefId = encodeURIComponent(credDefId)

    let res = await this.axios.get(`${ACAPY_ADMIN_PATHS.CREDENTIAL_DEFINITIONS}/${credDefId}`).catch(error => {
      console.log("Error loading credential definition by credDefId from ledger: " + error.response.statusText)
    })

    if (!res) {
      throw `Error loading credential definition by credDefId from ledger `;
    }

    return res.data.credential_definition;
  }

  async getCredDefBySchemaIdFromWallet(schemaID) {
    this.throwIfAgentIsNotReady();
    const res = await this.axios.get(`${ACAPY_ADMIN_PATHS.CREDENTIAL_DEFINITIONS}/created?schema_id=${schemaID}`)
    return (res.data.credential_definition_ids[0]);
  }

  async getSchemaByIdFromLedger(schemaID) {
    this.throwIfAgentIsNotReady();
    let res = await this.axios.get(`${ACAPY_ADMIN_PATHS.SCHEMAS}/${schemaID}`)
    return res.data.schema;
  }

  async getSchemaIdByNameFromWallet(schemaName) {
    this.throwIfAgentIsNotReady();
    const res = await this.axios.get(`${ACAPY_ADMIN_PATHS.SCHEMAS}/created?schema_name=${schemaName}`)
    return res.data.schema_ids[0];
  }

  // -------------------------- WEBHOOKS START ---------------------------- //
  async listenOnWebhookPort(webhookPort) {

    if (!webhookPort || !Number.isInteger(webhookPort)) {
      throw "Please provide a valid port for webhook listening.";
    }

    this.webhookApp = express();
    this.webhookApp.disable('x-powered-by');
    this.webhookApp.use(express.json());

    let me = this;
    this.webhookApp.post(ACAPY_WEBHOOK_PATHS.CONNECTIONS, function (req, res) {
      if (req.body.state === ACAPY_WEBHOOK_STATES.CONNECTIONS.RESPONSE) {
        me.emit(ACAPY_CLIENT_EVENTS.NEW_CONNECTION_ESTABLISHED, req.body);
      }

      res.sendStatus(200);
    });

    this.webhookApp.post(ACAPY_WEBHOOK_PATHS.PRESENT_PROOF, function (req, res) {
      if (req.body.state === ACAPY_WEBHOOK_STATES.PRESENT_PROOF.RECEIVED) {
        me.emit(ACAPY_CLIENT_EVENTS.PRESENTATION_RECEIVED, req.body)
      }

      res.sendStatus(200);
    });

    this.webhookApp.post(ACAPY_WEBHOOK_PATHS.ISSUE_CREDENTIAL, function (req, res) {

      if (req.body.state === ACAPY_WEBHOOK_STATES.ISSUE_CREDENTIAL.CREDENTIAL_OFFER_SENT) {
        me.emit(ACAPY_CLIENT_EVENTS.CREDENTIAL_OFFER_SENT, req.body.connection_id)
      } else if (req.body.state === ACAPY_WEBHOOK_STATES.ISSUE_CREDENTIAL.CREDENTIAL_ISSUED) {
        me.emit(ACAPY_CLIENT_EVENTS.CREDENTIAL_ISSUED, req.body.connection_id)
      }

      res.sendStatus(200);
    });

    this.webhookApp.listen(webhookPort, "0.0.0.0", () => {
      console.log(`${this.agentName ? this.agentName : "Some agent"} is listening at http://localhost:${webhookPort} for webhooks.`)
    })
  }
}

module.exports = AcapyClient;
