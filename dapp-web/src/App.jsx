import "./App.scss";

import { Route, Routes } from "react-router-dom";
import { Layout } from "./config/Layout";
import { NoMatch } from "./config/NoMatch";
import { About } from "./routes/About";
import Check from "./routes/Check";
import { Home } from "./routes/Home";
import { Web3Config } from "./config/Web3Config";
import { CompanyManagement } from "./routes/company/CompanyManagement";
import { CatalogManagement } from "./routes/operator/CatalogManagement";
import { useAccount } from "wagmi";
import { useRoleData } from "./hooks/useRoleData";
import { LotManagement } from "./routes/operator/LotManagement";

function App() {
  return (
    <Web3Config>
      <RouteConfig />
    </Web3Config>
  );
}

function RouteConfig() {
  const { address } = useAccount();
  const roles = useRoleData(address);

  console.log({ rolesTop: roles });
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="check" element={<Check />} />
        {roles.COMPANY === true && <Route path="company/manage" element={<CompanyManagement />} />}
        {roles.OPERATOR === true && (
          <>
            <Route path="operator/catalog" element={<CatalogManagement />} />
            <Route path="operator/lot" element={<LotManagement />} /> 
          </>
        )}
        <Route path="*" element={<NoMatch />} />
      </Route>
    </Routes>
  );
}

export default App;
