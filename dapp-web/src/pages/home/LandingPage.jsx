import { useState } from "react";
import { Button, Col, Container, Form, InputGroup, Nav, Navbar, Row } from "react-bootstrap";
import { BiLinkExternal } from "react-icons/bi";
import { Link, useNavigate } from "react-router-dom";

export function LandingPage() {
  return (
    <>
      <LandingPageHero />
      <LandingPage1 />
    </>
  );
}

export function LandingPageNavbar() {
  return (
    <Navbar expand="lg" className="bg-body-tertiary" style={{ height: "6em" }}>
      <Container className="gap-3 pb-3 rounded">
        <Navbar.Brand as={Link} to="/">
          Drug Supplychain dApp
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: "200px" }} navbarScroll>
            <Nav.Link as={Link} to="/">
              Início
            </Nav.Link>
          </Nav>
          <Button variant="outline-primary" as={Link} to="/platform">
            <span>Acessar plataforma</span>
            <BiLinkExternal style={{ marginLeft: "0.5em" }} />
          </Button>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
function LandingPageHero() {
  const [letCode, setLetCode] = useState("");
  const navigate = useNavigate();
  const handleLotCode = (e) => {
    setLetCode(e.target.value);
  };

  const searchLotCode = () => {
    try {
      const _lotCode = JSON.parse(atob(atob(letCode)));
      console.log({ _lotCode });
      navigate(`/search/${letCode}`);
    } catch (error) {
      console.log({ searchLotCodeError: error });
      setLetCode("");
    }
  };

  return (
    <>
      <div
        className="p-5 text-center bg-image rounded-3"
        style={{
          backgroundImage: "url('/tcc-ec-blockchain-drug-supplychain/background_home.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "600px",
        }}
      >
        <Container className="d-flex justify-content-left align-items-center h-100">
          <Row>
            <Col className="text-start text-white" md={10}>
              <h1 className="display-3 text-bg-gray">Transforme a Cadeia Farmacêutica com Rastreamento Blockchain</h1>
              <h4 className="text-bg-gray">
                Inovação Segura para Produtos de Valor: Rastreabilidade Precisa e Transparente
              </h4>
              <InputGroup className="w-100">
                <Form.Control
                  type="text"
                  placeholder="Pesquise pelo código"
                  className="mt-3 input-dark"
                  value={letCode}
                  onChange={handleLotCode}
                />
                <Button variant="dark" className="mt-3" onClick={searchLotCode}>
                  Pesquisar
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
function LandingPage1() {
  return (
    <>
      <Container>
        <div className="mt-5 home-p">
          <Row>
            <Col sm={12} md={4}>
              <p>
                Desenvolvemos uma solução revolucionária que utiliza blockchain e smart contracts, focada especialmente
                nos produtos farmacêuticos de maior valor comercial. Nosso objetivo central é criar um sistema
                abrangente que rastreia com precisão as origens, fornecedores e trajetória dos princípios ativos dos
                medicamentos.
              </p>
            </Col>

            <Col sm={12} md={4}>
              <p>
                Esta solução oferece meios eficazes para a inserção e consulta de registros logísticos em um ambiente
                descentralizado e altamente seguro. Projetada para atender diversas partes interessadas, como clientes,
                fornecedores, logísticas, fabricantes, ela proporciona uma plataforma confiável para transações seguras
                e transparentes.
              </p>
            </Col>

            <Col sm={12} md={4}>
              <p>
                A arquitetura do software integra um sistema cliente-servidor à tecnologia Polygon da Ethereum,
                desempenhando um papel central no núcleo do sistema blockchain associado a smart contracts. Essa
                abordagem garante o rastreamento eficiente de medicamentos por meio de vias digitais, assegurando
                conformidade, transparência e integridade em toda a cadeia farmacêutica. Transforme a forma como a
                indústria farmacêutica opera com a nossa solução de rastreamento inovadora.
              </p>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
}
