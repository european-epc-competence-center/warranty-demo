const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://warranty-demo.ssi.eecc.de'

const DEMO_STATE = Object.freeze({
    UNKNOWN: 'UNKNOWN',
    REQUESTED_CONNECTION_INVITATION_FROM_STORE_AND_BDR:
        'REQUESTED_CONNECTION_INVITATION_FROM_STORE_AND_BDR',
    ID_CREDENTIAL_OFFER_ACCEPTED: 'ID_CREDENTIAL_OFFER_ACCEPTED',
    CONNECTION_ESTABLISHED_WITH_STORE: 'CONNECTION_ESTABLISHED_WITH_STORE',
    EBON_CREDENTIAL_OFFER_SENT_BY_STORE: 'EBON_CREDENTIAL_OFFER_SENT_BY_STORE',
    EBON_CREDENTIAL_OFFER_ACCEPTED: 'EBON_CREDENTIAL_OFFER_ACCEPTED',
    REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER:
        'REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER',
    CONNECTION_ESTABLISHED_WITH_MANUFACTURER:
        'CONNECTION_ESTABLISHED_WITH_MANUFACTURER',
    EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER:
        'EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER',
    EBON_PRESENTATION_SENT_TO_MANUFACTURER:
        'EBON_PRESENTATION_PRESENTATION_SENT_TO_MANUFACTURER',
    EBON_PRESENTATION_VERIFIED_BY_MANUFACTURER:
        'EBON_PRESENTATION_VERIFIED_BY_MANUFACTURER',
    PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_SENT_BY_MANUFACTURER:
        'PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_SENT_BY_MANUFACTURER',
    PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_ACCEPTED:
        'PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_ACCEPTED',
    WARRANTY_CASE_FLOW_INITIATED_BY_USER: 'WARRANTY_CASE_FLOW_INITIATED_BY_USER',
    PRODUCT_CERTIFICATE_REQUEST_SENT_FROM_MANUFACTURER:
        'PRODUCT_CERTIFICATE_REQUEST_SENT_FROM_MANUFACTURER',
    PRODUCT_CERTIFICATE_PRESENTATION_SENT_TO_MANUFACTURER:
        'PRODUCT_CERTIFICATE_PRESENTATION_SENT_TO_MANUFACTURER',
    PRODUCT_CERTIFICATE_PRESENTATION_VERIFIED_BY_MANUFACTURER:
        'PRODUCT_CERTIFICATE_PRESENTATION_VERIFIED_BY_MANUFACTURER',
    ONLINE_ID_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER:
        'ONLINE_ID_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER',
    ONLINE_ID_PRESENTATION_SENT_TO_MANUFACTURER:
        'ONLINE_ID_PRESENTATION_SENT_TO_MANUFACTURER',
    ONLINE_ID_PRESENTATION_VERIFIED_BY_MANUFACTURER:
        'ONLINE_ID_PRESENTATION_VERIFIED_BY_MANUFACTURER'
})

const STORY_LINE = [
    DEMO_STATE.UNKNOWN,
    DEMO_STATE.REQUESTED_CONNECTION_INVITATION_FROM_STORE_AND_BDR,
    DEMO_STATE.ID_CREDENTIAL_OFFER_ACCEPTED,
    DEMO_STATE.CONNECTION_ESTABLISHED_WITH_STORE,
    DEMO_STATE.EBON_CREDENTIAL_OFFER_SENT_BY_STORE,
    DEMO_STATE.EBON_CREDENTIAL_OFFER_ACCEPTED,
    DEMO_STATE.REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER,
    DEMO_STATE.CONNECTION_ESTABLISHED_WITH_MANUFACTURER,
    DEMO_STATE.EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER,
    DEMO_STATE.EBON_PRESENTATION_SENT_TO_MANUFACTURER,
    DEMO_STATE.EBON_PRESENTATION_VERIFIED_BY_MANUFACTURER,
    DEMO_STATE.PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_SENT_BY_MANUFACTURER,
    DEMO_STATE.PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_ACCEPTED,
    DEMO_STATE.WARRANTY_CASE_FLOW_INITIATED_BY_USER,
    DEMO_STATE.PRODUCT_CERTIFICATE_REQUEST_SENT_FROM_MANUFACTURER,
    DEMO_STATE.PRODUCT_CERTIFICATE_PRESENTATION_SENT_TO_MANUFACTURER,
    DEMO_STATE.PRODUCT_CERTIFICATE_PRESENTATION_VERIFIED_BY_MANUFACTURER,
    DEMO_STATE.ONLINE_ID_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER,
    DEMO_STATE.ONLINE_ID_PRESENTATION_SENT_TO_MANUFACTURER,
    DEMO_STATE.ONLINE_ID_PRESENTATION_VERIFIED_BY_MANUFACTURER
]

module.exports.BACKEND_URL = BACKEND_URL
module.exports.DEMO_STATE = DEMO_STATE
module.exports.STORY_LINE = STORY_LINE

