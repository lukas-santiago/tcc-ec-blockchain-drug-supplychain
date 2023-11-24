import { Button, Col, Container, Form, InputGroup, Nav, Navbar } from "react-bootstrap";
import { BiLinkExternal } from "react-icons/bi";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <>
      <LandingPageNavbar />
      <LandingPageHero />
      <LandingPage1 />
    </>

  );
}

function LandingPageNavbar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary" style={{ height: '6em' }}>
      <Container className="gap-3">
        <Navbar.Brand as={Link} to="/">Drug Supplychain dApp</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '200px' }}
            navbarScroll
          >
            <Nav.Link as={Link} to="/">Início</Nav.Link>
          </Nav>
          <Button variant="outline-primary" as={Link} to="/platform">
            <span>Acessar plataforma</span>
            <BiLinkExternal style={{ marginLeft: '0.5em' }} />
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
function LandingPageHero() {
  return (
    <>
      <div className="p-5 text-center bg-image rounded-3" style={{
        'backgroundImage': "url('https://picsum.photos/seed/hero-seed-dark/2000/600')",
        'height': '600px'
      }}>
        <Container className="d-flex justify-content-left align-items-center h-100">
          <Col className="text-start text-white" md={6}>
            <h6 >New product</h6>
            <h1 className="display-3">Heading</h1>
            <h4 className="">Subheading</h4>
            <InputGroup className="w-100" >
              <Form.Control type="text" placeholder="Pesquise pelo código" className="mt-3" />
              <Button variant="outline-light" className="mt-3">Pesquisar</Button>
            </InputGroup>
            <div>
              <small>*By asd</small>
            </div>
          </Col>

        </Container>
      </div>
    </>
  )
}
function LandingPage1() {
  return (
    <></>
  )
}