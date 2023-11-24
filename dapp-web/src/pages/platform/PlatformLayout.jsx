import { Col, Container, Dropdown, Row, Toast, ToastContainer } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import { Web3Config } from "../../config/Web3Config";
import { Web3Navbar } from "../../components/Web3Navbar";

export function PlatformLayout() {
  return (
    <>
      <Web3Config>
        <Web3Navbar />
        <Container>
          <Row style={{ minHeight: "80vh" }}>
            <Col
              md={3}
              style={{
                borderRight: "solid 0.2em var(--bs-gray-900)",
              }}
            >
              Menus
              <hr />
              <Menus />
            </Col>
            <Col>
              <Outlet />
            </Col>
          </Row>
        </Container>
        <StackingExample />
      </Web3Config>
    </>
  );
}

function StackingExample() {
  return (
    <>
      <ToastContainer position="bottom-start">
        <div
          className="d-flex flex-column gap-2 add-blur-at-top custom-scrollbar p-4"
          style={{
            maxHeight: "65vh",
            overflowY: "auto",
          }}
        >
          <Toast style={{ width: "auto" }}>
            <Toast.Header>
              <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
              <strong className="me-auto">Bootstrap</strong>
              <small className="text-muted">2 seconds ago</small>
            </Toast.Header>
            <Toast.Body>Heads up, toasts will stack automatically</Toast.Body>
          </Toast>
          <Toast style={{ width: "auto" }}>
            <Toast.Header>
              <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
              <strong className="me-auto">Bootstrap</strong>
              <small className="text-muted">2 seconds ago</small>
            </Toast.Header>
            <Toast.Body>Heads up, toasts will stack automatically</Toast.Body>
          </Toast>
        </div>
      </ToastContainer>
    </>
  );
}

function Menus() {
  const menus = [
    {
      title: "Administrador",
      children: [
        {
          title: "Conceder funções especiais",
          path: "admin/grantSpecial",
        },
      ],
    },
    {
      title: "Gestor",
      children: [
        {
          title: "Companhia",
          path: "company/manage",
        },
        {
          title: "Conceder funções de operador",
          path: "company/grantOperator",
        },
      ],
    },
    {
      title: "Operador",
      children: [
        {
          title: "Catálogo",
          path: "operator/catalog",
        },
        {
          title: "Lote",
          path: "operator/lot",
        },
        {
          title: "Movimentação",
          path: "operator/movement",
        },
      ],
    },
  ];
  return (
    <div>
      {menus.map((menu, index) => (
        <div key={index}>
          <span>{menu.title}</span>
          <>
            {menu.children.map((child, index) => (
              <Dropdown.Item key={index} as={Link} to={child.path} className="ps-4">
                {child.title}
              </Dropdown.Item>
            ))}
          </>
        </div>
      ))}
    </div>
  );
}
