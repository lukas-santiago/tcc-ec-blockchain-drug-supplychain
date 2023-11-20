// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";

library ArrayTools {
  function includes(uint32[] memory _array, uint32 _element) internal pure returns (bool) {
    for (uint32 i = 0; i < _array.length; i++) {
      if (_array[i] == _element) {
        return true;
      }
    }
    return false;
  }
}

/// @custom:security-contact contact@example-supplychain-tcc.com
contract SupplyChainDAppBase is AccessControl {
  bytes32 public constant OWNER_ROLE = bytes32("OWNER");
  bytes32 public constant COMPANY_ROLE = bytes32("COMPANY");
  bytes32 public constant OPERATOR_ROLE = bytes32("OPERATOR");

  constructor() {
    _setRoleAdmin(OWNER_ROLE, DEFAULT_ADMIN_ROLE);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(OWNER_ROLE, msg.sender);
  }
}

contract SupplyChainDApp is SupplyChainDAppBase {
  constructor() {}

  using ArrayTools for uint32[];

  // User
  struct UserModel {
    bool registered;
    address _address;
    uint32[] companyIds;
    uint32[] operatorIds;
  }
  mapping(address => UserModel) public users;

  function me(address _address) public view returns (UserModel memory) {
    return users[_address];
  }

  event UserRegistered(address indexed user);

  function register() public {
    UserModel storage user = users[msg.sender];
    require(user.registered == false, "User is already registered.");
    user.registered = true;
    user._address = msg.sender;

    emit UserRegistered(msg.sender);
  }

  function grantRole(bytes32 role, address account) public override onlyRole(getRoleAdmin(role)) {
    super.grantRole(role, account);
  }

  function grantOperatorRole(uint32 companyId, address account, address companyOwner) public onlyRole(COMPANY_ROLE) {
    UserModel storage userOperator = users[account];
    require(userOperator.registered == true, "User is not registered.");

    require(companyId != 0, "Invalid company id.");
    UserModel storage userCompanyOwner = users[companyOwner];

    require(userCompanyOwner.companyIds.includes(companyId), "Company's owner is another.");
    require(userOperator.operatorIds.includes(companyId) == false, "User is already an operator.");

    userOperator.operatorIds.push(companyId);

    super._grantRole(OPERATOR_ROLE, account);
  }

  // Company
  struct CompanyModel {
    uint32 companyId;
    bytes32 name;
    bool isManufacture;
    bool isIntermediate;
    bool active;
    uint32[] productCatalogIds;
    uint32[] lotIds;
  }
  uint32 public companiesCount;
  mapping(uint32 => CompanyModel) public companies;

  event CompanyRegistered(uint32 companyId, address indexed account);

  function getCompany(uint32 companyId) public view returns (CompanyModel memory) {
    return companies[companyId];
  }

  function addCompany(bytes32 name, bool isManufacture, bool isIntermediate) public onlyRole(COMPANY_ROLE) {
    companiesCount++;

    CompanyModel memory _company;
    _company.companyId = companiesCount;
    _company.name = name;
    _company.isManufacture = isManufacture;
    _company.isIntermediate = isIntermediate;
    _company.active = true;

    companies[companiesCount] = _company;

    users[msg.sender].companyIds.push(companiesCount);

    emit CompanyRegistered(companiesCount, msg.sender);
  }

  function editCompany(CompanyModel memory company) public onlyRole(COMPANY_ROLE) isCompanyOwner(company.companyId) {
    companies[company.companyId].name = company.name;
    companies[company.companyId].isManufacture = company.isManufacture;
    companies[company.companyId].isIntermediate = company.isIntermediate;
  }

  function disableCompany(uint32 companyId) public onlyRole(COMPANY_ROLE) isCompanyOwner(companyId) {
    companies[companyId].active = false;
  }

  modifier isCompanyOwner(uint32 companyId) {
    UserModel storage user = users[msg.sender];
    bool checked = false;
    for (uint i = 0; i < user.companyIds.length; i++) {
      if (user.companyIds[i] == companyId) {
        checked = true;
      }
    }
    require(checked, "User is not a company owner of this company.");
    _;
  }

  modifier isOperatorOfCompany(uint32 companyId) {
    UserModel storage user = users[msg.sender];
    bool checked = false;
    for (uint i = 0; i < user.operatorIds.length; i++) if (user.operatorIds[i] == companyId) checked = true;
    require(checked, "User is not an operator of this company.");
    _;
  }

  modifier isManufactureCompany(uint32 companyId) {
    CompanyModel memory company = companies[companyId];
    require(company.isManufacture, "Company is not a manufacture company.");
    _;
  }

  modifier isIntermediateCompany(uint32 companyId) {
    CompanyModel memory company = companies[companyId];
    require(company.isIntermediate, "Company is not an intermediate company.");
    _;
  }

  // Catalogo
  struct CatalogModel {
    uint32 catalogId;
    uint32 companyId;
    bytes32 productName;
    bool active;
  }

  uint32 public catalogCount;
  mapping(uint32 => CatalogModel) public catalogs;

  function getCatalog(uint32 catalogId) public view returns (CatalogModel memory) {
    return catalogs[catalogId];
  }

  function addCatalog(
    uint32 companyId,
    bytes32 name
  ) public onlyRole(OPERATOR_ROLE) isOperatorOfCompany(companyId) isManufactureCompany(companyId) {
    catalogCount++;

    CatalogModel memory _catalog;
    _catalog.catalogId = catalogCount;
    _catalog.companyId = companyId;
    _catalog.productName = name;
    _catalog.active = true;

    catalogs[catalogCount] = _catalog;

    companies[companyId].productCatalogIds.push(catalogCount);
  }

  function editCatalog(
    uint32 companyId,
    uint32 catalogId,
    bytes32 name
  ) public onlyRole(OPERATOR_ROLE) isOperatorOfCompany(companyId) isManufactureCompany(companyId) {
    catalogs[catalogId].productName = name;
  }

  function disableCatalog(
    uint32 companyId,
    uint32 catalogId
  ) public onlyRole(OPERATOR_ROLE) isOperatorOfCompany(companyId) isManufactureCompany(companyId) {
    require(catalogs[catalogId].active, "Catalog is already disabled.");
    catalogs[catalogId].active = false;
  }

  // TODO: Implementar a lógica da gestão de lote
  // Produto (Product)
  struct ProductModel {
    uint32 catalogId;
    uint32 quantity;
  }

  mapping(uint32 => ProductModel[]) public lotProducts;

  function getLotProducts(uint32 lotId) public view returns (ProductModel[] memory) {
    return lotProducts[lotId];
  }

  // Lote (Lot)
  struct LotModel {
    uint32 lotId;
    uint32 manufacturerId;
    uint32 quantity;
    uint32 catalogCount;
    bool confirmed;
    bool active;
  }

  uint32 public lotCount;
  mapping(uint32 => LotModel) public lots;

  function getLot(uint32 lotId) public view returns (LotModel memory) {
    return lots[lotId];
  }

  function addLot(
    uint32 companyId,
    uint32 quantity
  ) public onlyRole(OPERATOR_ROLE) isOperatorOfCompany(companyId) isManufactureCompany(companyId) {
    lotCount++;

    require(quantity > 0, "Quantity must be greater than zero.");

    LotModel memory _lot;
    _lot.lotId = lotCount;
    _lot.manufacturerId = companyId;
    _lot.quantity = quantity;
    _lot.confirmed = false;
    _lot.active = true;

    lots[lotCount] = _lot;

    companies[companyId].lotIds.push(lotCount);
  }

  function editLot(
    uint32 companyId,
    uint32 lotId,
    uint32 newQuantity,
    ProductModel[] memory newProducts
  )
    public
    onlyRole(OPERATOR_ROLE)
    isOperatorOfCompany(companyId)
    isManufactureCompany(companyId)
    onlyValidLot(lotId)
    onlyUnconfirmedLot(lotId)
    onlyEnabledLot(lotId)
  {
    require(newQuantity > 0, "Quantity must be greater than zero.");
    require(newProducts.length < 100, "Quantity of product catalogs must be less than 100.");

    uint counter;
    for (uint i = 0; i < newProducts.length; i++) {
      require(newProducts[i].quantity > 0, "Quantity of product must be greater than zero.");
      counter += newProducts[i].quantity;
    }
    require(counter == newQuantity, "lot quantity must be equal to product quantity");

    lots[lotId].quantity = newQuantity;
    lots[lotId].catalogCount = uint32(newProducts.length);

    delete lotProducts[lotId];
    for (uint i = 0; i < newProducts.length; i++) {
      lotProducts[lotId].push(newProducts[i]);
    }
  }

  function confirmLot(
    uint32 companyId,
    uint32 lotId
  )
    public
    onlyRole(OPERATOR_ROLE)
    isOperatorOfCompany(companyId)
    isManufactureCompany(companyId)
    onlyValidLot(lotId)
    onlyEnabledLot(lotId)
  {
    // require(lots[lotId].products.length == lots[lotId].quantity, "lot quantity must be equal to product quantity");
    lots[lotId].confirmed = true;
  }

  function disableLot(
    uint32 companyId,
    uint32 lotId
  )
    public
    onlyRole(OPERATOR_ROLE)
    isOperatorOfCompany(companyId)
    isManufactureCompany(companyId)
    onlyValidLot(lotId)
    onlyEnabledLot(lotId)
  {
    lots[lotId].active = false;
  }

  modifier onlyValidLot(uint32 lotId) {
    require(lots[lotId].lotId > 0 && lots[lotId].lotId <= lotCount, "invalid lot id");
    _;
  }

  modifier onlyUnconfirmedLot(uint32 lotId) {
    require(!lots[lotId].confirmed, "lot already confirmed");
    _;
  }

  modifier onlyEnabledLot(uint32 lotId) {
    require(lots[lotId].active, "lot is disabled");
    _;
  }
  // TODO: Implementar a lógica da movimentação de lote

  // struct LotActivity {
  //   uint32 activityId;
  //   uint32 lotId;
  //   string activity;
  // }

  //   uint32 public activityCount;
  //   mapping(uint32 => LotActivity) public lotActivities;

  //   function registerActivity(
  //     uint32 companyId,
  //     uint16 lotId,
  //     string memory activity
  //   ) public onlyRole(OPERATOR_ROLE) isOperatorOfCompany(companyId) isIntermediateCompany(companyId) onlyValidLot(lotId) {
  //     activityCount++;
  //     lotActivities[activityCount] = LotActivity(activityCount, lotId, activity, msg.sender, block.timestamp, false, 0);
  //   }
  // TODO: Implementar a lógica do rastro de atividade
}
