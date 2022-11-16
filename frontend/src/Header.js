import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

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
  

export default Header
