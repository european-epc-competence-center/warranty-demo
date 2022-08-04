import React, { useState, useEffect } from 'react'
import './Demo.css'
import NextStateButton from './NextStateButton'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap'
import axios from 'axios'
import QRCode from 'react-qr-code'
import Accordion from 'react-bootstrap/Accordion'
import Spinner from 'react-bootstrap/Spinner'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { ReactComponent as AppStoreLogo } from './assets/apple-appstore-badge.svg'
import { ReactComponent as PlayStoreLogo } from './assets/google-play-badge.svg'

import { BACKEND_URL } from './Config'

const GS1Logo = require('./assets/logoGS1.png')
const EECCLogo = require('./assets/eecc.png')
const IDUnionLogo = require('./assets/IDunion_squard.png')
const IDIdealLogo = require('./assets/ID-Ideal.png')
const eBon = require('./assets/eBon_credential.png')
const eBonOverview = require('./assets/ebon-overview.png')
const warranty = require('./assets/certificate_credential.png')



const Demo = () => {
  /*console.log(BACKEND_URL);*/

  const [intervalID, setIntervalID] = useState(null)
  const [demoState, setDemoState] = useState({
    state: 'UNKNOWN',
    data: {}
  })

  const [demoUserID, setDemoUserID] = useState('')

  const [activeTab, setActiveTab] = useState('0')

  const [activeSubTab, setActiveSubTab] = useState('0')

  const [activeQRCode, setActiveQRCode] = useState('')

  const [nextState, setNextState] = useState('')

  const [bdrQrCodeValue, setBdrQrCodeValue] = useState('')

  useEffect(() => {
    if (intervalID) {
      clearInterval(intervalID)
    }

    setIntervalID(
      setInterval(async () => {
        const res = await axios.get(BACKEND_URL + '/api/getDemoState', {
          params: { demo_user_id: demoUserID }
        })
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
        setActiveQRCode(recievedData.data.store_invitation_url)
        setBdrQrCodeValue(recievedData.data.bdr_invitation_url)
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
        setActiveTab('1')
        setActiveSubTab('2')
        break
      case 'REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER':
        setActiveTab('2')
        setActiveSubTab('-1')
        setActiveQRCode(recievedData.data.manufacturer_invitation_url)
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
        setNextState(recievedData.data.nextState)
        break
      case 'WARRANTY_CASE_FLOW_INITIATED_BY_USER':
      case 'PRODUCT_CERTIFICATE_REQUEST_SENT_FROM_MANUFACTURER':
        setActiveTab('3')
        setActiveSubTab('0')
        break
      case 'PRODUCT_CERTIFICATE_PRESENTATION_VERIFIED_BY_MANUFACTURER':
      case 'ONLINE_ID_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER':
        setActiveSubTab('1')
        break
      case 'ONLINE_ID_PRESENTATION_SENT_TO_MANUFACTURER':
      case 'ONLINE_ID_PRESENTATION_VERIFIED_BY_MANUFACTURER':
        setActiveSubTab('2')
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
        QRCodeValue={activeQRCode}
        demoUserID={demoUserID}
        initiateWarrantyStep={nextState}
        bdrQrCodeValue={bdrQrCodeValue}
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
              Todays typical wallets are in the process of being digitalized and this is not only about money and payment.
              Tickets, Vouchers and identity documents can already now, or soon will be, found in a digital wallet.
              An important feature that sets the self-sovereign identity (SSI) approach apart from centralized solutions is that the user maintains
              full control over his data. Concretely, a Base ID credential will serves as a digital version of the German national ID card.
              By the use of modern cryptography in SSI, the user maintains control over who can get which information. This is to be contrasted with an identity model where
              a single-sign-on (SSO) at a big internet company lets the controller know and even choose who can get which information and
              this central controller even gets to know every time I use such an SSO ID.
            </p>

            <h2>SSI in trade and commerce</h2>
            <p>
              A typical physical wallet likely contains more trade related "documents" then passports.
              The digitalization of ID Cards, such as membership cards, naturally carries over to all sorts of loyalty cards.
              In this demo, we would like to highlight and also technically demonstrate that SSI technology is also very suitable
              for the digitalization of <b>bons and warranty certificates</b>. If done right, SSI will not only keep the current
              level of paper/plastic based systems, but increase privacy/sovereignty, usability and efficiency for the end user as well as the merchant.
            </p>

            <h2>Setup</h2>
            <p>
              This is an interactive demonstration which will issue actual signed documents, so called <b>verifiable credentials</b>, to your personal SSI wallet.
              While many people, from open source communities and small start ups all the way up to Google are developing wallet applications,
              you might not yet have an SSI wallet compatible with the exact version of this rapidly developing technology on your mobile phone, yet.
            </p>
            <p>
              The simplest way to get one
              is to use the{' '}
              <a href='https://lissi.id/' target='_blank' rel='noreferrer'>
                Lissi
              </a>{' '}
              mobile Wallet. Please install this app now. You can safely delete it after the demo.
            </p>
            <div className='d-flex flex-column align-items-center mb-2'>
              <a
                href='https://play.google.com/store/apps/details?id=io.lissi.mobile.android'
                target='_blank'
                rel='noreferrer'
              >
                <PlayStoreLogo width='150' />
              </a>
              <a
                href='https://apps.apple.com/app/lissi-wallet/id1529848685'
                target='_blank'
                rel='noreferrer'
              >
                <AppStoreLogo width='150' />
              </a>
            </div>

            <h2>Getting Started</h2>
            <p>
              This Demo can be viewed on a big screen, interacting with your mobile wallet through QR code scans.
              This also demonstrates how the demonstrated interactions between the involved parties can be facilitated.
            </p>
            <p>
              If you are viewing this demo on the same mobile which also holds the wallet, that is perfectly fine.
              In this case, just touch the QR codes to start the interaction with your wallet.
              After completing the wallet process, switch back to your browser in order to continue with the story line.
            </p>
            <p>
              To obtain your first verifiable credential and start this demo, please scan/tip the QR code below.
              This will initiate a communication with a mock of a Bundesdruckerei Service.
              This service is actual work in progress that will enable you to derive a base ID credential with a very high trust level
              from your German national ID card (eID). However, for this demonstration, we will just provide you with a demo ID
              which has a similar structure than the actual base ID. Please accept this credential to start the next step of the demo.
            </p>
            <p>
              Importantly, any credential in your wallet can only accessed with your explicit consent.
              We demonstrate data minimal flows in the following. Mind who asks for what and, in particular, which information can stay private.
            </p>
            <div className='d-flex justify-content-center'>
              <div className='qrCode-wrapper'>
                <a href={props.bdrQrCodeValue}>
                  <QRCode value={props.bdrQrCodeValue} />
                </a>
              </div>
            </div>

          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='1'>
          <Accordion.Header>Use Case: eBon</Accordion.Header>
          <Accordion.Body>
            <Accordion activeKey={props.activeSubKey}>
              <div className='d-flex justify-content-center m-3'>
                <img src={eBonOverview} width='80%' alt='eBon use case' />
              </div>
              <Accordion.Item eventKey='0'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>Connecting to the vendor </Col>
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
                    You have bought a new tool. After the purchase, the vendor offers an eBon
                    credential via showing this QR code.
                  </p>
                  <p>
                    Please scan/tip the QR code below. This will establish a
                    connection with the vendor.
                  </p>

                  <div className='d-flex justify-content-center'>
                    <div className='qrCode-wrapper'>
                      <a href={props.QRCodeValue}>
                        <QRCode value={props.QRCodeValue} />
                      </a>
                    </div>
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
                    Credential directly to your wallet, please accept it there.
                  </p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='2'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>eBon Credential recieved</Col>
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
                    <img src={eBon} width='120' alt='eBon Credential' />
                  </div>
                  <p>
                    You just obtained your first eBon Credential! It contains
                    your eBon for your purchased tool. This credential is stored
                    in your wallet, so you have full controll over whom you want
                    to show it. Just like a piece of paper in your physical
                    wallet.
                  </p>
                  <p>
                    Now imagine that you carried your bought product home. On
                    the product (packaging) there is a QR Code for obtaining the
                    warranty certificate. Click the button below to continue to
                    that QR Code.
                  </p>
                  <div className='d-flex justify-content-center'>
                    <NextStateButton
                      nextState={
                        'REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER'
                      }
                      label='Request Warranty'
                      demoUserID={props.demoUserID}
                    />
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='2'>
          <Accordion.Header>Warranty Certificate</Accordion.Header>
          <Accordion.Body>
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
                  <p>
                    To start the process of obtaining you your warranty, scan
                    the following QR code in order to establish a connection to
                    the manufacturer.
                  </p>
                  <div className='d-flex justify-content-center'>
                    <div className='qrCode-wrapper'>
                      <a href={props.QRCodeValue}>
                        <QRCode value={props.QRCodeValue} />
                      </a>
                    </div>
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
                    You succesfully established a connection with the
                    manufacturer!
                  </p>
                  <p>
                    Before issuing a warranty, the manufactuer asks for a
                    presentation of a valid eBon Credential in order to
                    verifying when and where the tool was bought. The
                    presentation request is sent directly to your Wallet. For
                    any such request, you can check which data is requested and
                    decide whether you want to share this data with the
                    requesting party.
                  </p>
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
                    The manufacturer recieved your eBon data. After verifying
                    it, he will send you your product warranty certificate.
                  </p>
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
                    You recieved the warranty credential from the manufacturer!
                    Now you have a digital representation of the product
                    warranty stored in your wallet. Again, this information is
                    not stored in any central databank but locally on your
                    mobile phone so that you can decide whom you want to show
                    it.
                  </p>
                  <p>
                    Now, imagine that your tool has an unexpected malfunction.
                    Click the button below to open a warranty case with the
                    manufacturer. In a real world scenario, this should be
                    triggered directly form the warranty certificate, but this
                    feature is not yet avaiable in the lissi app.
                  </p>
                  <div className='d-flex justify-content-center'>
                    <NextStateButton
                      nextState={props.initiateWarrantyStep}
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
                    In order to open a warranty case,the manufacturer will first
                    ask you to present you warranty certificate via your Wallet.
                  </p>
                  <p>
                    Again, you can see <b>who</b> requests <b>what</b>
                    data and decide whether to answer the presentation request.
                  </p>
                  <p>
                    Additionally, the manufacturer asks you to provide a
                    description of the mal function, which you can also provide
                    directly through your wallet.
                  </p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='1'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>Request Pick Up</Col>
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
                  <p>The manufacturer found your Warranty to be valid!</p>
                  <p>
                    You may now order a pick up of your tool. To this end, you
                    can present your address data from your base ID credential.
                    This step demonstrates how personaldata can be imported from your wallet if and only if you consent.
                  </p>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey='2'>
                <Accordion.Header>Happy End</Accordion.Header>
                <Accordion.Body>
                  <p>Your product is picked up, repaired, and returned!</p>
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

                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  )
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

const Header = props => {
  return (
    <Container>
      <nav className='navbar navbar-light bg-light'>
        <Container>
          <Row>
            <Col>
              <a href='https://www.gs1-germany.de/'>
                <img src={GS1Logo} height='120' alt='GS1 Logo' />
              </a>
            </Col>
            <Col xs={6}>
              <h1>eBon and Product Warranty via SSI - a Demonstration</h1>
            </Col>
            <Col>
              <a href='https://idunion.org/?lang=en'>
                <img src={IDUnionLogo} height='120' alt='ID Union Logo' />
              </a>
            </Col>
            <Col>
              <a href='https://id-ideal.de/en/'>
                <img src={IDIdealLogo} height='120' alt='ID Ideal Logo' />
              </a>
            </Col>
          </Row>
        </Container>
      </nav>
    </Container>
  )
}

const Footer = props => {
  return (
    <footer className='container'>
      <div className='d-flex justify-content-center align-items-center'>
        <h6>Made by</h6>
        <a href='https://eecc.info/'>
          <img
            src={EECCLogo}
            width='120'
            alt='EECC Logo'
            style={{ margin: '10px' }}
          />
        </a>
        <h6>European EPC Competence Center</h6>
      </div>
    </footer>
  )
}

export default Demo
