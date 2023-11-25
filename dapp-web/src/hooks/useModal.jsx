import React from "react";


export function useModal() {
  const [show, setShow] = React.useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return {
    show,
    handleClose,
    handleShow,
  };
}
