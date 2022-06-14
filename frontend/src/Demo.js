import React, { useState, useEffect } from 'react'
import './Demo.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap'
import axios from 'axios'
import QRCode from 'react-qr-code'
import Accordion from 'react-bootstrap/Accordion'
import Spinner from 'react-bootstrap/Spinner'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { ReactComponent as AppStoreLogo } from './assets/apple-appstore-badge.svg'
import { ReactComponent as PlayStoreLogo } from './assets/google-play-badge.svg'

const GS1Logo = require('./assets/logoGS1.png')
const EECCLogo = require('./assets/eecc.png')
const IDUnionLogo = require('./assets/IDunion_squard.png')
const IDIdealLogo = require('./assets/ID-Ideal.png')
const eBon = require('./assets/eBon_credential.png')
const warranty = require('./assets/certificate_credential.png')

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://warranty-demo.ssi.eecc.de'

/**const AppStoreLogo = require("./assets/apple-appstore-badge.svg");**/
/*const PlayStoreLogo = require("./assets/google-play-badge.svg");**/

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

        if (bdrQrCodeValue === '') {
          /*
            1. get XSRF token
            -> GET https://ssi-issuer.tir.budru.de/ssi-test/test.html
            -> Read from cooky

            2. get invitation for base ID a la
            curl 'https://ssi-issuer.tir.budru.de/ssi-test/api/debug/invite'  -v -H 'Content-Type: application/json;charset=UTF-8'  -H 'Cookie: XSRF-TOKEN=0e10e413-6e87-4b33-9111-fbea1979e2ce'   --data-raw '{"familyName":"Mustermann","firstName":"Sebastian","academicTitle":"","birthName":"","dateOfBirth":"19881107","addressStreet":"Kommandantenstr. 18","addressZipCode":"10969","addressCity":"Berlin","addressCountry":"Deutschland","placeOfBirth":"Berlin","dateOfExpiry":"20220430"}'
            */
        }
      }, 1000)
    )
  }, [demoUserID])

  const determineTab = recievedData => {
    switch (recievedData.state) {
      case 'REQUESTED_CONNECTION_INVITATION_FROM_STORE':
        setActiveTab('0')
        setActiveSubTab('0')
        //setActiveQRCode(recievedData.data.store_invitation_url)
        setBdrQrCodeValue(recievedData.data.bdr_invitation_url)
        break
      case 'CONNECTION_ESTABLISHED_WITH_STORE':
      case 'EBON_CREDENTIAL_OFFER_SENT_BY_STORE':
        setActiveTab('0')
        setActiveSubTab('1')
        break
      case 'EBON_CREDENTIAL_OFFER_ACCEPTED':
        setActiveTab('0')
        setActiveSubTab('2')
        break
      case 'REQUESTED_CONNECTION_INVITATION_FROM_MANUFACTURER':
        setActiveTab('1')
        setActiveSubTab('-1')
        setActiveQRCode(recievedData.data.manufacturer_invitation_url)
        break
      case 'CONNECTION_ESTABLISHED_WITH_MANUFACTURER':
      case 'EBON_PRESENTATION_REQUEST_SENT_FROM_MANUFACTURER':
        setActiveTab('1')
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
        setActiveTab('2')
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
    <div class='container'>
      <Accordion id='outerDemoAccordion' activeKey={props.activeMainKey}>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>Wallet setup and BaseID</Accordion.Header>
          <Accordion.Body>
            <p>
              For this Demo you need an SSI Wallet. The simplest way to get one
              is to use the{' '}
              <a href='https://lissi.id/' target='_blank' rel='noreferrer'>
                Lissi
              </a>{' '}
              mobile Wallet, which you need to install on your mobile phone. You
              can safely delete the app after the demo.
            </p>
            <div class='d-flex flex-column align-items-center mb-2'>
              <a
                href='https://apps.apple.com/app/lissi-wallet/id1529848685'
                target='_blank'
                rel='noreferrer'
              >
                <PlayStoreLogo width='150' />
              </a>
              <a
                href='https://play.google.com/store/apps/details?id=io.lissi.mobile.android'
                target='_blank'
                rel='noreferrer'
              >
                <AppStoreLogo width='150' />
              </a>              
              <p>
                In the end of the demo, will use
                an base-ID issued by Bundesdruckerei
                This BaseID will be derived from
                your real govenrmental ID card in the near future.
              </p>
              
              <div class='d-flex justify-content-center'>
              <div className='qrCode-wrapper'>
                <a href={props.bdrQrCodeValue}>
                  <QRCode value={props.bdrQrCodeValue} />
                </a>
              </div>
              </div> 
            </div>
            
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey='0'>
          <Accordion.Header>eBon</Accordion.Header>
          <Accordion.Body>
            <Accordion activeKey={props.activeSubKey}>
              <Accordion.Item eventKey='0'>
                <Accordion.Header>
                  <Container fluid style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Row>
                      <Col>Starting eBon import: Connecting to Vendor</Col>
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
                    You have bought a tool. The vendor offers an eBon
                    credential.
                  </p>
                  <p>
                    Please scan the QR code below. This will establish a
                    connection with the vendor.
                  </p>
                  {/*
                  <div class='d-flex justify-content-center'>
                    <div className='qrCode-wrapper'>
                      <a href={props.QRCodeValue}>
                        <QRCode value={props.QRCodeValue} />
                      </a>
                    </div>
                  </div>*/}
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
                    The Vendor is connected with you! He will send you an eBon
                    Credential directly to your wallet.
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
                  <div class='d-flex justify-content-center'>
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
                  <div class='d-flex justify-content-center'>
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
        <Accordion.Item eventKey='1'>
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
                  <div class='d-flex justify-content-center'>
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
                  <div class='d-flex justify-content-center'>
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
                  <div class='d-flex justify-content-center'>
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
        <Accordion.Item eventKey='2'>
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
                    demo are
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
                  </p>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  )
}

const DisplayCheckmark = props => {
  //console.log(props)
  if (props.eventKey < props.activeSubKey) {
    return <i class='bi bi-check-lg'></i>
  } else if (props.eventKey === props.activeSubKey) {
    return <Spinner animation='border' variant='light' />
  }
  return null
}

const NextStateButton = props => {
  function setDemoStateAtBackend () {
    axios.post(BACKEND_URL + '/api/setDemoState', null, {
      params: { nextState: props.nextState, demo_user_id: props.demoUserID }
    })
  }

  return (
    <Button variant='secondary' onClick={setDemoStateAtBackend}>
      {props.label}
    </Button>
  )
}

const Header = props => {
  return (
    <div class='container'>
      <nav class='navbar navbar-light bg-light'>
        <div class='container'>
          <a class='navbar-brand' href='https://www.gs1-germany.de/'>
            <img src={GS1Logo} height='120' alt='GS1 Logo' />
          </a>
          <h1>SSI Product Warranty Demo</h1>
          <a class='navbar-brand' href='https://idunion.org/?lang=en'>
            <img src={IDUnionLogo} height='120' alt='ID Union Logo' />
          </a>
          <a class='navbar-brand' href='https://id-ideal.de/en/'>
            <img src={IDIdealLogo} height='120' alt='ID Ideal Logo' />
          </a>
        </div>
      </nav>
    </div>
  )
}

const Footer = props => {
  return (
    <footer class='container'>
      <div class='d-flex justify-content-center align-items-center'>
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
