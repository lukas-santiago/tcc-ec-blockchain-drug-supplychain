import { Outlet } from 'react-router-dom';
import { CustomNavbar } from './CustomNavbar';
import { Container } from 'react-bootstrap';

export function Layout() {
  return (
    <Container>
      <CustomNavbar />
      <Outlet />
    </Container>
  );
}
