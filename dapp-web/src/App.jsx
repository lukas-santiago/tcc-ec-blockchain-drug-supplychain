import "./App.scss";

import { Route, Routes } from "react-router-dom";
import { Web3Provider } from "./contexts/Web3Context";
import { LandingPage } from "./pages/home/LandingPage";
import { PlatformLayout } from "./pages/platform/PlatformLayout";
import { GrantSpecialRoles } from "./pages/platform/admin/GrantSpecialRoles";
import { CompanyManagement } from "./pages/platform/manager/CompanyManagement";
import { GrantOperatorRoles } from "./pages/platform/manager/GrantOperatorRoles";
import { CatalogManagement } from "./pages/platform/operator/CatalogManagement";
import { LotManagement } from "./pages/platform/operator/LotManagement";
import { MovementManagement } from "./pages/platform/operator/MovementManagement";
import { PlatformHome } from "./pages/platform/PlatformHome";
import { NoMatch } from "./pages/NoMatch";

function App() {
  return (
    <>
      <Web3Provider>
        <RouteConfig />
      </Web3Provider>
    </>
  );
}

function RouteConfig() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />}>
        <Route index element={<LandingPage />} />
        <Route path="*" element={<NoMatch />} />
      </Route>
      <Route path="platform" element={<PlatformLayout />}>
        <Route path="" element={<PlatformHome />} />
        <Route path="*" element={<NoMatch />} />
        <>
          <Route path="admin/grantSpecial" element={<GrantSpecialRoles />} />
        </>
        <>
          <Route path="company/manage" element={<CompanyManagement />} />
          <Route path="company/grantOperator" element={<GrantOperatorRoles />} />
        </>
        <>
          <Route path="operator/catalog" element={<CatalogManagement />} />
          <Route path="operator/lot" element={<LotManagement />} />
          <Route path="operator/movement" element={<MovementManagement />} />
        </>
      </Route>
    </Routes>
  );
}

export default App;
