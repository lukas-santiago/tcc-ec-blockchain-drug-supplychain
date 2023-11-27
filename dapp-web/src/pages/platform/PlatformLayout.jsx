import React from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { Link, Outlet } from "react-router-dom";
import { useAccount } from "wagmi";
import { Web3Navbar } from "../../components/Web3Navbar";
import { Web3Config } from "../../config/Web3Config";
import { Web3Context } from "../../contexts/Web3Context";
import { useRoleData } from "../../hooks/useRoleData";

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
              <Menus />
            </Col>
            <Col className="ps-5 pe-5" md={9}>
              <Outlet />
            </Col>
          </Row>
        </Container>
        {/* <StackingExample /> */}
      </Web3Config>
    </>
  );
}

// function StackingExample() {
//   return (
//     <>
//       <ToastContainer position="bottom-start">
//         <div
//           className="d-flex flex-column gap-2 add-blur-at-top custom-scrollbar p-4"
//           style={{
//             maxHeight: "65vh",
//             overflowY: "auto",
//           }}
//         >
//           <Toast style={{ width: "auto" }}>
//             <Toast.Header>
//               <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
//               <strong className="me-auto">Bootstrap</strong>
//               <small className="text-muted">2 seconds ago</small>
//             </Toast.Header>
//             <Toast.Body>Heads up, toasts will stack automatically</Toast.Body>
//           </Toast>
//           <Toast style={{ width: "auto" }}>
//             <Toast.Header>
//               <img src="holder.js/20x20?text=%20" className="rounded me-2" alt="" />
//               <strong className="me-auto">Bootstrap</strong>
//               <small className="text-muted">2 seconds ago</small>
//             </Toast.Header>
//             <Toast.Body>Heads up, toasts will stack automatically</Toast.Body>
//           </Toast>
//         </div>
//       </ToastContainer>
//     </>
//   );
// }

function Menus() {
  const { address } = useAccount();
  const { web3Data } = React.useContext(Web3Context);
  useRoleData(address);

  console.log({ web3Data });

  const { roles } = web3Data?.user || {};

  const menus = [];

  if (roles?.OWNER === true)
    menus.push({
      title: "Administrador",
      children: [
        {
          title: "Conceder funções especiais",
          path: "admin/grantSpecial",
        },
      ],
    });

  if (roles?.COMPANY === true)
    menus.push({
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
    });

  if (roles?.OPERATOR === true)
    menus.push({
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
    });

  return (
    <>
      <h4>Serviços</h4>
      <hr />
      <div className="d-flex flex-column gap-3">
        {menus.map((menu, index) => (
          <div key={index} className="d-flex flex-column gap-2">
            <strong className="pb-2 text-center">{menu.title}</strong>
            <>
              {menu.children.map((child, index) => (
                <Button key={index} as={Link} to={child.path} className="ps-4" variant="secondary">
                  {child.title}
                </Button>
              ))}
            </>
          </div>
        ))}
      </div>
    </>
  );
}
