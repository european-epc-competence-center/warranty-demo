exports.ACAPY_CLIENT_EVENTS = Object.freeze({
  CONNECTED: "ACAPY_CLIENT_CONNECTED",
  NEW_CONNECTION_ESTABLISHED: "NEW_CONNECTION_ESTABLISHED",
  CREDENTIAL_OFFER_SENT: "CREDENTIAL_OFFER_SENT",
  CREDENTIAL_ISSUED: "CREDENTIAL_ISSUED",
  PRESENTATION_RECEIVED: "PRESENTATION_RECEIVED"
});

exports.ACAPY_ADMIN_PATHS = Object.freeze({
  STATUS_READY: "/status/ready",
  CONNECTIONS: "/connections",
  CONNECTIONS_CREATE_INVITATION: "/connections/create-invitation",
  SCHEMAS: "/schemas",
  CREDENTIAL_DEFINITIONS: "/credential-definitions",
  WALLET_PUBLIC_DID: "/wallet/did/public",
  CREDENTIAL_ISSUE: "/issue-credential/send"
});

exports.ACAPY_WEBHOOK_PATHS = Object.freeze({
  CONNECTIONS: "/topic/connections",
  PRESENT_PROOF: "/topic/present_proof",
  ISSUE_CREDENTIAL: "/topic/issue_credential"
});

exports.ACAPY_WEBHOOK_STATES = Object.freeze({
  CONNECTIONS: {
    RESPONSE: "response"
  },
  PRESENT_PROOF: {
    RECEIVED: "presentation_received"
  },
  ISSUE_CREDENTIAL: {
    CREDENTIAL_OFFER_SENT: "offer_sent",
    CREDENTIAL_ISSUED: "credential_issued"
  }
})
