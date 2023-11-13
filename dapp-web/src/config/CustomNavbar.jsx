import { Container, Nav, NavDropdown, Navbar } from "react-bootstrap";
import ConnectButton from "./Web3Config";

export function CustomNavbar() {
  return (
    <Navbar expand="lg" variant="light" bg="light">
      <Container fluid>
        <Navbar.Brand href="/">Company</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: "100px" }} navbarScroll>
            <NavDropdown title="Serviços">
              <NavDropdown.Item href="/check">Checar código</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link href="/about">Sobre nós</Nav.Link>
          </Nav>
          <ConnectButton />
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
