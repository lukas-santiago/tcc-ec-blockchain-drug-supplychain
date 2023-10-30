// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

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
}

contract CompanyOwner is Models {
    // CompanyManagement
    function addCompany(
        bytes32 name,
        CompanyTypeModel memory companyType
    ) public {
        companiesCount++;

        companies[companiesCount] = CompanyModel(
            companiesCount,
            name,
            companyType,
            true
        );
    }

    function editCompanyName(uint16 companyId, bytes32 name) public {
        companies[companyId].name = name;
    }

    function editCompanyType(
        uint16 companyId,
        CompanyTypeModel memory companyType
    ) public {
        companies[companyId].companyType = companyType;
    }

    function disableCompany(uint16 companyId) public {
        companies[companyId].active = false;
    }
    // AccessManagement
}

contract ManufacturerCompany is Models {
    modifier onlyValidCompany(uint16 companyId) {
        require(
            companies[companyId].companyId > 0 &&
                companies[companyId].companyId <= companiesCount,
            "invalid company id"
        );
        _;
    }

    modifier onlyValidCatalog(uint16 catalogId) {
        require(
            catalogs[catalogId].catalogId > 0 &&
                catalogs[catalogId].catalogId <= catalogCount,
            "invalid catalog id"
        );
        _;
    }

    function addCatalog(
        uint16 companyId,
        bytes32 name
    ) public onlyValidCompany(companyId) {
        catalogCount++;
        catalogs[catalogCount] = CatalogModel(
            catalogCount,
            companyId,
            name,
            true
        );
    }

    function editCatalogName(
        uint16 catalogId,
        bytes32 name
    ) public onlyValidCatalog(catalogId) {
        catalogs[catalogId].productName = name;
    }

    function disableCatalog(
        uint16 catalogId
    ) public onlyValidCatalog(catalogId) {
        catalogs[catalogId].active = false;
    }
}

contract dApp is CompanyOwner, ManufacturerCompany {}
