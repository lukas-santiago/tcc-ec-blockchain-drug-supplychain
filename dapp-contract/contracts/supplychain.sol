// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CompanyOwner {
    // CompanyManagement
    constructor() {
        companiesCount = 0;
    }

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

    uint16 companiesCount;
    mapping(uint16 => CompanyStruct) companies;

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


contract ManufacturerCompany {
    

    struct CatalogStruct {
    uint16 catalogCount;
        
    }

    uint32 catalogCount;
    mapping (uint32 => ) name;

    constructor() {
        
    }
}