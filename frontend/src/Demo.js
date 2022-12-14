import React, { useState, useEffect } from 'react'
import './Demo.css'
import NextStateButton from './NextStateButton'
import Header from './Header'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap'
import axios from 'axios'
import QRCode from 'react-qr-code'
import Accordion from 'react-bootstrap/Accordion'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import { isMobile } from 'react-device-detect';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { ReactComponent as AppStoreLogo } from './assets/apple-appstore-badge.svg'
import { ReactComponent as PlayStoreLogo } from './assets/google-play-badge.svg'

const EECCLogo = require('./assets/eecc.png')
const eBon = require('./assets/eBon_credential.png')
const eBonOverview = require('./assets/ebon-overview.png')
const warranty = require('./assets/certificate_credential.png')
const warranty_stoy = require('./assets/warranty_story.png')
const bmwk_logo = require('./assets/BMWK.jpg')


const config = require('./Config.js')
const STORY_LINE = config.DEMO_STATE
const BACKEND_URL = config.BACKEND_URL

const restartDemoAfter = 60

var restartTimer = restartDemoAfter

const Demo = () => {
  // console.log("Backend URL: " + BACKEND_URL);

  const [intervalID, setIntervalID] = useState(null)
  const [demoState, setDemoState] = useState({
    state: STORY_LINE[0],
    data: {
      store_invitation_url: '',
      manufacturer_invitation_url: ''

    }
  })

  const [demoUserID, setDemoUserID] = useState('')

  const [activeTab, setActiveTab] = useState('0')

  const [activeSubTab, setActiveSubTab] = useState('0')

  const [demoStateReturned, setdemoStateReturned] = useState(true)

  useEffect(() => {
    if (intervalID) {
      clearInterval(intervalID)
    }

    setIntervalID(
      setInterval(async () => {
        if (!demoStateReturned) {
          return;
        }
        setdemoStateReturned(false)
        const res = await axios.get(BACKEND_URL + '/api/getDemoState', {
          params: { demo_user_id: demoUserID }
        })
        setdemoStateReturned(true)
        const recievedData = res.data

        if (recievedData && recievedData.data) {
          if (recievedData.data.demo_user_id !== demoUserID) {
            setDemoUserID(recievedData.data.demo_user_id)
          }
        }

        if (!demoState || demoState.state !== recievedData.state) {
          /*console.log(recievedData);*/
          setDemoState(recievedData)
          determineTab(recievedData)
        }
      }, 1000)
    )
  }, [demoUserID])



  const determineTab = recievedData => {
    switch (recievedData.state) {
      case 'REQUESTED_CONNECTION_INVITATION_FROM_STORE_AND_BDR':
        setActiveTab('0')
        break
      case 'ID_CREDENTIAL_OFFER_ACCEPTED':
        setActiveTab('1')
        setActiveSubTab('0')
        break
      case 'CONNECTION_ESTABLISHED_WITH_STORE':
      case 'EBON_CREDENTIAL_OFFER_SENT_BY_STORE':
        setActiveTab('1')
        setActiveSubTab('1')
        break
      case 'EBON_CREDENTIAL_OFFER_ACCEPTED':
      case 'REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER':
        setActiveTab('2')
        setActiveSubTab('-1')
        break
      case 'CONNECTION_ESTABLISHED_WITH_MANUFACTURER':
      case 'EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER':
        setActiveTab('2')
        setActiveSubTab('0')
        break
      case 'EBON_PRESENTATION_PRESENTATION_SENT_TO_MANUFACTURER':
      case 'EBON_PRESENTATION_VERIFIED_BY_MANUFACTURER':
      case 'PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_SENT_BY_MANUFACTURER':
        setActiveSubTab('1')
        break
      case 'PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_ACCEPTED':
        setActiveSubTab('2')
        break
      case 'WARRANTY_CASE_FLOW_INITIATED_BY_USER':
      case 'PRODUCT_CERTIFICATE_REQUEST_SENT_FROM_MANUFACTURER':
        setActiveTab('3')
        setActiveSubTab('0')
        break
      case 'PRODUCT_CERTIFICATE_PRESENTATION_VERIFIED_BY_MANUFACTURER':
      case 'ONLINE_ID_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER':
      case 'ONLINE_ID_PRESENTATION_SENT_TO_MANUFACTURER':
      case 'ONLINE_ID_PRESENTATION_VERIFIED_BY_MANUFACTURER':
        setActiveSubTab('2')
        if (restartTimer >= restartDemoAfter) {
          restartTimer = restartDemoAfter - 1
          setInterval(async () => {
            if (restartTimer <= 0) {
              reloadPage()
            }
            restartTimer = restartTimer - 1
            console.log(restartTimer)
          }, 1000)
        }
        break
      case 'UNKNOWN':
      default:
        setActiveTab('0')
        setActiveSubTab('0')
    }
  }

  return (
    <div className='demo'>
      <Header />
      <MainAccordion
        activeMainKey={activeTab}
        activeSubKey={activeSubTab}
        demoUserID={demoUserID}
        demoState={demoState}
        restartTimer={restartTimer}
      />
      <Footer />
    </div>
  )
}

const MainAccordion = props => {
  return (
    <Container>
      <Accordion id='outerDemoAccordion' activeKey={props.activeMainKey}>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>Self-Sovereign Identity</Accordion.Header>
          <Accordion.Body>
            <h2>Brief General Introduction to SSI</h2>
            <p>
              Today's typical wallets are in the process of being digitalized and this is not only about money and payment.
              Tickets, Vouchers, and identity documents can already now, or soon will be, found in a digital wallet.
              An important feature that sets the self-sovereign identity (SSI) approach apart from centralized solutions is that the user maintains
              full control over his data. Concretely, a Base ID credential will serve as a digital version of the German national ID card.
              By the use of modern cryptography in SSI, the user maintains control over who can get which information. This is to be contrasted with an identity model where
              a single-sign-on (SSO) at a big internet company lets the controller know and even choose who can get which information and
              this central controller even gets to know every time one uses such an SSO ID.
            </p>

            <h2>SSI in trade and commerce</h2>
            <p>
              A typical physical wallet likely contains more trade-related "documents" than passports.
              The digitalization of ID Cards, such as membership cards, naturally carries over to all sorts of loyalty cards.
              In this demo, we would like to highlight and also technically demonstrate that SSI technology is also very suitable
              for the digitalization of <b>bons and warranty certificates</b>. If done right, SSI will not only keep the current
              level of paper/plastic-based based systems, but increase privacy/sovereignty, usability and efficiency for the end user as well as the merchant.
            </p>

            <h2>Setup</h2>
            <p>
              This is an interactive demonstration that will issue actual signed documents, so-called <b>verifiable credentials</b>, to your personal SSI wallet.
              While many people, from open source communities and small start-ups all the way up to Google are developing wallet applications,
              you might not yet have an SSI wallet compatible with the exact version of this rapidly developing technology on your mobile phone yet.
            </p>
            <p>
              The simplest way to get one
              is to use the{' '}
              <a href='https://lissi.id/' target='_blank' rel='noreferrer'>
                Lissi Mobile Wallet
              </a>{' '}
              . Please install this app now. You can safely delete it after the demo.
            </p>
            <div className='d-flex flex-row align-items-center row justify-content-center mb-2'>
              <div className='d-flex flex-column align-items-center col-md-3 p-3'>
                {!isMobile ? <QRCode size={140} value={'https://play.google.com/store/apps/details?id=io.lissi.mobile.android'} /> : ''}
                <a
                  href='https://play.google.com/store/apps/details?id=io.lissi.mobile.android'
                  target='_blank'
                  rel='noreferrer'
                  className='mt-1 shadow'
                >
                  <PlayStoreLogo width='150' />
                </a>
              </div>
              <div className='d-flex flex-column align-items-center col-md-3 p-3'>
                {!isMobile ? <QRCode size={140} value={'https://apps.apple.com/app/lissi-wallet/id1529848685'} /> : ''}
                <a
                  href='https://apps.apple.com/app/lissi-wallet/id1529848685'
                  target='_blank'
                  rel='noreferrer'
                  className='mt-1 shadow'
                >
                  <AppStoreLogo width='150' />
                </a>
              </div>
            </div>

            <p>
              This Demo can be viewed on a big screen, interacting with your mobile wallet through QR code scans.
              This also demonstrates how the demonstrated interactions between the involved parties can be facilitated.
            </p>
            <p>
              If you are viewing this demo on the same mobile which also holds the wallet, that is perfectly fine.
              In this case, just touch the QR codes to start the interaction with your wallet.
              After completing the wallet process, switch back to your browser in order to continue with the storyline.
            </p>

            <h2>Getting Started</h2>
            <p>
              The actual user story of this demo starts in a DIY store, where you have just bought a new tool.
            </p>

            <div className='d-flex justify-content-center m-3'>
              <img src={eBonOverview} width='70%' alt='eBon use case' />
            </div>

            <p>
              After the purchase, the vendor offers an eBon
              credential by showing this QR code at the point of sale.
              Since this is the first time that you are buying in this shop, you do not yet have a connection to the vendor.
              This is the SSI jargon to say that the vendor is not in your SSI contact list. Let's remedy this.
            </p>
            <p>
              Please scan/tip the QR code below. This will establish a
              connection with the vendor.
            </p>

            <div className='d-flex justify-content-center'>
              <div className='qrCode-wrapper'>
                <a href={props.demoState.data.store_invitation_url}>
                  <QRCode value={props.demoState.data.store_invitation_url} />
                </a>
              </div>
            </div>

            <div className='d-flex justify-content-center'>
              <NextStateButton
                currentState={props.demoState.state}
                label='Skip'
                force={true}
                demoUserID={props.demoUserID}
              />
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='1'>
          <Accordion.Header>
            <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
              <Row>
                <Col>Receiving eBon</Col>
                <Col md={{ span: 1, offset: 5 }}>
                  <DisplayCheckmark
                    eventKey='1'
                    activeSubKey={props.activeSubKey}
                  />
                </Col>
              </Row>
            </Container>
          </Accordion.Header>
          <Accordion.Body>
            <p>
              You have established a connection to the vendor.
              For the vendor, SSI connections offer very interesting possibilities in terms of CRM which we discuss in another demo.
              For now, the vendor will just send an eBon
              Credential directly to your wallet over the established connection.
            </p>
            <p>
              Note that no information about yourself was revealed. The vendor can associate the information about your purchase with your pseudonymous
              connection (id), but you may choose to create a new pseudonymous connection for each purchase.
              The vendor may offer benefits if you re-use an existing connection and hence start to accumulate information
              about you as a frequent customer, but you do not have to take this offer in order to benefit from the eBon credentials.
              The data sovereignty stays entirely with the user.
            </p>
            <p>
              Please accept the credential offer in your wallet.
            </p>
            <div className='d-flex justify-content-center'>
              <NextStateButton
                nextState='EBON_CREDENTIAL_OFFER_ACCEPTED'
                label='Skip'
                force={true}
                demoUserID={props.demoUserID}
              />
            </div>
          </Accordion.Body>
        </Accordion.Item>

        <Accordion.Item eventKey='2'>
          <Accordion.Header>Warranty Certificate</Accordion.Header>
          <Accordion.Body>
            <div className='d-flex justify-content-center m-3'>
              <img src={warranty_stoy} width='80%' alt='warranty use case' />
            </div>
            <p>
              The main point of this demo is to give an idea of how a complete product warranty use case
              can be implemented in a way that at the same time respects the user's privacy by requiring as
              little data as possible and still preventing warranty fraud more effectively than today's processes.
            </p>

            <Accordion activeKey={props.activeSubKey}>
              <Accordion.Item eventKey='-1'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>Connecting to the Manufacturer</Col>
                      <Col md={{ span: 1, offset: 5 }}>
                        <DisplayCheckmark
                          eventKey='0'
                          activeSubKey={props.activeSubKey}
                        />
                      </Col>
                    </Row>
                  </Container>
                </Accordion.Header>
                <Accordion.Body>
                  <div className='d-flex justify-content-center'>
                    <img src={eBon} width='120' alt='eBon Credential' />
                  </div>
                  <p>
                    You just obtained your first eBon Credential! It contains
                    your eBon for your purchased tool. This credential is stored
                    in your wallet, so you have full control over whom you want
                    to show it. Just like a piece of paper in your physical
                    wallet.
                  </p>
                  <p>
                    Now imagine that you carried your bought product home. On
                    the product (packaging) there is a QR Code for obtaining the
                    warranty certificate.
                  </p>
                  <div className='d-flex justify-content-center'>
                    <div className='qrCode-wrapper'>
                      <a href={props.demoState.data.manufacturer_invitation_url}>
                        <QRCode value={props.demoState.data.manufacturer_invitation_url} />
                      </a>
                    </div>
                  </div>
                  <div className='d-flex justify-content-center'>
                    <NextStateButton
                      nextState='EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER'
                      label='Skip'
                      force={true}
                      demoUserID={props.demoUserID}
                    />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='0'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>eBon Presentation</Col>
                      <Col md={{ span: 1, offset: 5 }}>
                        <DisplayCheckmark
                          eventKey='0'
                          activeSubKey={props.activeSubKey}
                        />
                      </Col>
                    </Row>
                  </Container>
                </Accordion.Header>
                <Accordion.Body>
                  <p>
                    You successfully established a connection with the
                    manufacturer!
                  </p>
                  <p>
                    Before issuing a warranty, the manufacturer asks for a
                    presentation of a valid eBon Credential in order to
                    verify when and where the tool was bought. The
                    presentation request is sent directly to your Wallet. For
                    any such request, you can check which data is requested and
                    decide whether you want to share this data with the
                    requesting party.
                  </p>
                  <p>
                    Notice that no personal data is queried. Instead, you present proof
                    that you bought exactly this item and information about when and where it was bought.
                    Even more, you only partially disclose the ebon, keeping the price of the purchase secret.
                  </p>
                  <div className='d-flex justify-content-center'>
                    <NextStateButton
                      nextState='PRODUCT_CERTIFICATE_CREDENTIAL_OFFER_SENT_BY_MANUFACTURER'
                      label='Skip'
                      force={true}
                      demoUserID={props.demoUserID}
                    />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='1'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>Warranty Issuance</Col>
                      <Col md={{ span: 1, offset: 5 }}>
                        <DisplayCheckmark
                          eventKey='1'
                          activeSubKey={props.activeSubKey}
                        />
                      </Col>
                    </Row>
                  </Container>
                </Accordion.Header>
                <Accordion.Body>
                  <p>
                    After the manufacturer recieves your eBon data, he can run some further checks on your presentation to make super
                    that no one requested a warranty for this exact item, the location and time of the purchase are plausible, etc.
                    Once your warranty request is found to be valid, the manufacturer sends your product warranty certificate directly to your wallet.
                  </p>
                  <p>
                    In this demo, we simplify the process by issuing the warranty directly to the product owner, hence binding the warranty to a person.
                    In reality, the warranty should be issued to the product itself, which would enable it to easily travel with the product if it is e.g. sold again.
                  </p>
                  <p>
                    Please accept the warranty certificate in your wallet.
                  </p>
                  <div className='d-flex justify-content-center'>
                    <NextStateButton
                      currentState={props.demoState.state}
                      label='Skip'
                      force={true}
                      demoUserID={props.demoUserID}
                    />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='2'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>Warranty Obtained</Col>
                      <Col md={{ span: 1, offset: 5 }}>
                        <DisplayCheckmark
                          eventKey='2'
                          activeSubKey={props.activeSubKey}
                        />
                      </Col>
                    </Row>
                  </Container>
                </Accordion.Header>
                <Accordion.Body>
                  <div className='d-flex justify-content-center'>
                    <img src={warranty} width='120' alt='eBon Credential' />
                  </div>
                  <p>
                    You received the warranty credential from the manufacturer!
                    Now you have a digital representation of the product
                    warranty stored in your wallet. This information is
                    not stored in any central data bank but locally on your
                    mobile phone so that you can decide whom you want to show
                    it.
                  </p>
                  <p>
                    Now, imagine that your tool has an unexpected malfunction.
                    Click the button below to open a warranty case with the
                    manufacturer. You can use the warranty certifiate in your wallet
                    to trigger a warranty case. To this end, just follow the "claim-endpoint"
                    link. Alternatively, just click the button below:
                  </p>
                  <div className='d-flex justify-content-center'>
                    <NextStateButton
                      currentState={props.demoState.state}
                      label='Claim Warranty!'
                      demoUserID={props.demoUserID}
                    />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='3'>
          <Accordion.Header>Claiming Warranty</Accordion.Header>
          <Accordion.Body>
            <Accordion activeKey={props.activeSubKey}>
              <Accordion.Item eventKey='0'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>Opening a Case</Col>
                      <Col md={{ span: 1, offset: 5 }}>
                        <DisplayCheckmark
                          eventKey='0'
                          activeSubKey={props.activeSubKey}
                        />
                      </Col>
                    </Row>
                  </Container>
                </Accordion.Header>
                <Accordion.Body>
                  <p>
                    In order to open a warranty case, the manufacturer or a contracted service provider will first
                    ask you to present your warranty certificate via your Wallet.
                  </p>
                  <p>
                    Again, you can see <b>who</b> requests <b>what data</b> and decide whether to answer the presentation request.
                  </p>
                  <p>
                    Additionally, you can
                    description of the malfunction directly with the warranty presentation.
                    Using this feature, you can get information directly from a customer
                    without the need of creating an account and logging him into a website.
                    The proof guarantees that the information entered stems from the warranty certificate holder.
                  </p>
                  <div className='d-flex justify-content-center'>
                    <NextStateButton
                      currentState={props.demoState.state}
                      label='Skip'
                      nextState={'ONLINE_ID_PRESENTATION_VERIFIED_BY_MANUFACTURER'}
                      force={true}
                      demoUserID={props.demoUserID}
                    />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='2'>
                <Accordion.Header>Happy End</Accordion.Header>
                <Accordion.Body>
                  <p>
                    The manufacturer found your Warranty to be valid!
                    Your product will be repaired!
                  </p>
                  <p>
                    The main advantages of using Verifiable credentials in this
                    demo are:
                  </p>
                  <ul>
                    <li>
                      The User has full controll over his data and
                      certificates. No omniscient platform.
                    </li>
                    <li>
                      Standardised data exchange and authenticity validation
                      enables integration into many use cases. No direct
                      integration between the involved parties needed.
                    </li>
                    <li>
                      The user experience of a unified wallet for many
                      different types of credentials and a wide range of use
                      cases is expected to be much better than having single a
                      lot of purpose apps for every individual use case.
                    </li>
                  </ul>

                  <div className='d-flex justify-content-center'>
                    <Button variant='secondary' onClick={reloadPage} className="m-2">
                      Restart Demo ({props.restartTimer})
                    </Button>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  )
}

const reloadPage = () => {
  window.location.reload()
}

const DisplayCheckmark = props => {
  //console.log(props)
  if (props.eventKey < props.activeSubKey) {
    return <i className='bi bi-check-lg'></i>
  } else if (props.eventKey === props.activeSubKey) {
    return (<Spinner animation='border' variant='light' >
      <span className="visually-hidden">In progress...</span>
    </Spinner>
    )

  }
  return null
}

const Footer = props => {
  return (
    <footer className='container'>
      <div className='d-flex justify-content-center align-items-center'>
        <h6>Made by</h6>
        <a href='https://eecc.info/'>
          <img
            src={EECCLogo}
            height='150'
            alt='EECC Logo'
            style={{ margin: '10px' }}
          />
        </a>
        <h6>European EPC Competence Center</h6>
        <img
          src={bmwk_logo}
          height='150'
          alt='EECC Logo'
          style={{ margin: '10px' }}
        />
      </div>
      <div className='d-flex justify-content-center align-items-center my-5'>
        <small>This project is open source on </small>
        <a href="https://github.com/european-epc-competence-center/warranty-demo">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#6795d0" className="bi bi-github ms-1" viewBox="0 0 16 16">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
      </div>
    </footer>
  )
}

export default Demo
