// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

contract Models {
  constructor() {
    companiesCount = 0;
  }

  // Company
  struct CompanyTypeModel {
    bool isManufacture;
    bool isIntermediate;
    bool isEndPoint;
  }
  struct CompanyModel {
    uint16 companyId;
    bytes32 name;
    CompanyTypeModel companyType;
    bool active;
  }
  uint16 public companiesCount;
  mapping(uint16 => CompanyModel) public companies;

  // Catalog
  struct CatalogModel {
    uint16 catalogId;
    uint16 companyId;
    bytes32 productName;
    bool active;
  }

  uint16 public catalogCount;
  mapping(uint16 => CatalogModel) public catalogs;

  // Lote (Lot)
  struct LotModel {
    uint16 lotId;
    uint16[] productIds;
    uint16 manufacturerId;
    uint32 quantity;
    bool confirmed;
    bool active;
  }

  uint16 public lotCount;
  mapping(uint16 => LotModel) public lots;

  // Produto (Product)
  struct ProductModel {
    uint16 productId; // Exemplo de campo adicional para um produto
    uint16 catalogId;
  }

  uint16 public productCount;
  mapping(uint16 => ProductModel) public products;

  // LotActivity (Atividade de Lote)
  struct LotActivity {
    uint16 activityId;
    uint16 lotId;
    string activity;
    address actor;
    uint256 started_at;
    bool finished;
    uint256 finished_at;
  }

  uint16 public activityCount;
  mapping(uint16 => LotActivity) public lotActivities;

  // Funções auxiliares (Modifiers)

  // Modificadores e funções auxiliares para Company (Company)
  modifier onlyValidCompany(uint16 companyId) {
    require(
      companies[companyId].companyId > 0 && companies[companyId].companyId <= companiesCount,
      "invalid company id"
    );
    _;
  }

  // Evento para o registro de atividades
  event ActivityRegistered(uint16 activityId, uint16 companyId, string activity, address actor, uint256 timestamp);

  // Evento para o registro de empresas
  event CompanyRegistered(
    uint16 companyId,
    bytes32 name,
    bool isManufacture,
    bool isIntermediate,
    bool isEndPoint,
    bool active
  );
}

contract CompanyOwner is Models {
  // CompanyManagement
  function addCompany(bytes32 name, CompanyTypeModel memory companyType) public {
    companiesCount++;

    companies[companiesCount] = CompanyModel(companiesCount, name, companyType, true);

    emit CompanyRegistered(
      companiesCount,
      name,
      companyType.isManufacture,
      companyType.isIntermediate,
      companyType.isEndPoint,
      true
    );
  }

  function editCompanyName(uint16 companyId, bytes32 name) public {
    companies[companyId].name = name;
  }

  function editCompanyType(uint16 companyId, CompanyTypeModel memory companyType) public {
    companies[companyId].companyType = companyType;
  }

  function disableCompany(uint16 companyId) public {
    companies[companyId].active = false;
  }
  // AccessManagement
}

contract ManufacturerCompany is Models {
  modifier onlyValidCatalog(uint16 catalogId) {
    require(catalogs[catalogId].catalogId > 0 && catalogs[catalogId].catalogId <= catalogCount, "invalid catalog id");
    _;
  }

  function addCatalog(uint16 companyId, bytes32 name) public onlyValidCompany(companyId) {
    catalogCount++;
    catalogs[catalogCount] = CatalogModel(catalogCount, companyId, name, true);
  }

  function editCatalogName(uint16 catalogId, bytes32 name) public onlyValidCatalog(catalogId) {
    catalogs[catalogId].productName = name;
  }

  function disableCatalog(uint16 catalogId) public onlyValidCatalog(catalogId) {
    catalogs[catalogId].active = false;
  }

  // Recurso de Lote (Lot Feature)
  function addLot(
    uint16[] memory productIds,
    uint16 manufacturerId,
    uint32 quantity
  ) public onlyValidProducts(productIds) {
    lotCount++;
    lots[lotCount] = LotModel(
      lotCount,
      productIds,
      manufacturerId,
      quantity,
      false, // Inicialmente, não confirmado
      true // Ativo
    );
  }

  function editLot(
    uint16 lotId,
    uint16[] memory newProductIds,
    uint32 newQuantity
  ) public onlyValidLot(lotId) onlyUnconfirmedLot(lotId) onlyValidProducts(newProductIds) {
    LotModel storage lot = lots[lotId];
    lot.productIds = newProductIds;
    lot.quantity = newQuantity;

    emit ActivityRegistered(activityCount, lotId, "Confirmacao do Lote", msg.sender, block.timestamp);
  }

  function confirmLot(uint16 lotId) public onlyValidLot(lotId) {
    lots[lotId].confirmed = true;

    // Registrar atividade de confirmação do lote
    activityCount++;
    lotActivities[activityCount] = LotActivity(
      activityCount,
      lotCount,
      "Criacao do Lote",
      msg.sender,
      block.timestamp,
      false,
      0
    );
  }

  function disableLot(uint16 lotId) public onlyValidLot(lotId) {
    lots[lotId].active = false;
  }

  // Modificadores e funções auxiliares para Lote (Lot)
  modifier onlyValidLot(uint16 lotId) {
    require(lots[lotId].lotId > 0 && lots[lotId].lotId <= lotCount, "invalid lot id");
    _;
  }

  modifier onlyUnconfirmedLot(uint16 lotId) {
    require(!lots[lotId].confirmed, "cannot modify or disable a confirmed lot");
    _;
  }

  // Recurso de Produto (Product Feature)
  function addProduct(uint16 catalogId) public {
    productCount++;
    products[productCount] = ProductModel(productCount, catalogId);
  }

  // Modificadores e funções auxiliares para Product (Product)
  modifier onlyValidProducts(uint16[] memory productIds) {
    for (uint256 i = 0; i < productIds.length; i++) {
      require(
        products[productIds[i]].productId > 0 && products[productIds[i]].productId <= productCount,
        "invalid product id"
      );
    }
    _;
  }
}

contract IntermediateCompany is Models {
  // Função para registrar atividade da empresa intermediária
  function registerActivity(uint16 lotId, string memory activity) public onlyValidCompany(lotId) {
    activityCount++;
    lotActivities[activityCount] = LotActivity(activityCount, lotId, activity, msg.sender, block.timestamp, false, 0);

    emit ActivityRegistered(activityCount, lotId, activity, msg.sender, block.timestamp);
  }
}

contract dApp is CompanyOwner, ManufacturerCompany, IntermediateCompany {}
