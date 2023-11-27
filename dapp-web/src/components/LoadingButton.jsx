import { PropTypes } from "prop-types";
import { Button, Spinner } from "react-bootstrap";

export function LoadingButton({ isLoading, onClick, title, children, loadingElement, variant, isDisabled }) {
  if (isLoading)
    return loadingElement ? (
      loadingElement
    ) : (
      <Button variant={variant || "primary"} disabled>
        <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
        <span className="ms-2">Carregando...</span>
      </Button>
    );
  else
    return title ? (
      <Button variant="primary" onClick={onClick} disabled={isDisabled}>
        {title}
      </Button>
    ) : (
      children
    );
}
LoadingButton.propTypes = {
  isLoading: PropTypes.bool,
  onClick: PropTypes.func,
  title: PropTypes.string,
  children: PropTypes.node,
  loadingElement: PropTypes.node,
  variant: PropTypes.string,
  isDisabled: PropTypes.bool,
};
