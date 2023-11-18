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

function App() {
  return (
    <Web3Config>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="check" element={<Check />} />
          <Route path="company/manage" element={<CompanyManagement />} />
          <Route path="operator/catalog" element={<CatalogManagement />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </Web3Config>
  );
}

export default App;
