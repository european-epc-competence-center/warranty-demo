import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import QRCode from 'react-qr-code'
import {isMobile} from 'react-device-detect';

const GS1Logo = require('./assets/logoGS1.png')
const IDUnionLogo = require('./assets/IDunion_squard.png')
const IDIdealLogo = require('./assets/ID-Ideal.png')


const Header = props => {
    return (
      <Container>
        <nav className='navbar navbar-light bg-light'>
          <Container>
            <Row>
              <Col>
                <a href='https://www.gs1-germany.de/'>
                  <img className='header-logo' src={GS1Logo} alt='GS1 Logo' />
                </a>
              </Col>
              {!isMobile ?<Col><QRCode size={80} value={'https://demonstration-ssi.gs1-germany.de/'} /></Col>:''}
              <Col xs={12} xl={7}>
                <h1>eBon and Product Warranty via SSI - a Demonstration</h1>
              </Col>
              <Col>
                <a href='https://idunion.org/?lang=en'>
                  <img className='header-logo' src={IDUnionLogo}  alt='ID Union Logo' />
                </a>
              </Col>
              <Col>
                <a href='https://id-ideal.de/en/'>
                  <img src={IDIdealLogo} className='header-logo' alt='ID Ideal Logo' />
                </a>
              </Col>
            </Row>
          </Container>
        </nav>
      </Container>
    )
  }
  

export default Header
