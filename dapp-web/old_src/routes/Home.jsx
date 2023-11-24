import { Button, Form, InputGroup } from "react-bootstrap";

export function Home() {
  return (
    <section>
      <div className="row">
        <div className="col d-flex justify-content-center align-items-center">
          <div>
            <h1>Code Verifier</h1>
            {/*  p to explain verification */}
            <p>Verify code of traceable assets.</p>
            <Form>
              <InputGroup>
                <Form.Control type="text" placeholder="Code" aria-label="Code" aria-describedby="basic-addon1" />
                <Button variant="outline-secondary" id="button-addon1">
                  Verify
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">Please enter the code</Form.Text>
            </Form>
          </div>
        </div>
        <div className="col">
          <img
            src="https://i.ibb.co/0YKZLXG/Code-Verifier.png"
            alt="Code-Verifier"
            border="0"
            width="600"
            height="600"
          />
        </div>
      </div>
    </section>
  );
}
