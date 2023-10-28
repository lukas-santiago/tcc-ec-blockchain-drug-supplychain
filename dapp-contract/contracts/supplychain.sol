// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Resources {
    constructor() {
        companiesCount = 0;
    }

    // Company
    struct CompanyTypeStruct {
        bool isManufacture;
        bool isIntermediate;
        bool isEndPoint;
    }
    struct CompanyStruct {
        uint16 companyId;
        bytes32 name;
        CompanyTypeStruct companyType;
        bool active;
    }
    uint16 public companiesCount;
    mapping(uint16 => CompanyStruct) public companies;

    // Catalog
    struct CatalogStruct {
        uint16 catalogId;
        uint16 companyId;
        bytes32 productName;
        bool active;
    }

    uint16 public catalogCount;
    mapping(uint16 => CatalogStruct) public catalogs;
}

contract CompanyOwner is Resources {
    // CompanyManagement
    function addCompany(
        bytes32 name,
        CompanyTypeStruct memory companyType
    ) public {
        companiesCount++;

        companies[companiesCount] = CompanyStruct(
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
        CompanyTypeStruct memory companyType
    ) public {
        companies[companyId].companyType = companyType;
    }

    function disableCompany(uint16 companyId) public {
        companies[companyId].active = false;
    }

    function getCompany(
        uint16 companyId
    ) public view returns (CompanyStruct memory company) {
        return companies[companyId];
    }
    // AccessManagement
}

contract ManufacturerCompany is Resources {
    function addCatalog(uint16 companyId, bytes32 name) public {
        catalogCount++;
        catalogs[catalogCount] = CatalogStruct(
            catalogCount,
            companyId,
            name,
            true
        );
    }

    function editCatalogName(uint16 catalogId, bytes32 name) public {
        catalogs[catalogId].productName = name;
    }

    function disableCatalog(uint16 catalogId) public {
        catalogs[catalogId].active = false;
    }
}

contract dApp is CompanyOwner, ManufacturerCompany {}
