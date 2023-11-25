import { CloseButton, Col, Modal, Row } from "react-bootstrap";
import { PropTypes } from "prop-types";

export function CustomModal({ show, handleClose, title, children, buttons }) {
  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Body className="p-4">
        <Row className="p-3">
          <Col>
            <h6 className="text-center text-secondary-emphasis">{title}</h6>
          </Col>
          <CloseButton onClick={handleClose} />
        </Row>

        <Row className="p-3">
          <Col>{children}</Col>
        </Row>
        <Row>
          <Col className="d-flex flex-row gap-3 justify-content-center">{buttons}</Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

CustomModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  buttons: PropTypes.node.isRequired,
};
