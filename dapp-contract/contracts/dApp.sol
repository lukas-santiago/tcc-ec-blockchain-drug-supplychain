// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract User {
    constructor() {
        addUser("owner");
    }

    struct UserStruct {
        address wallet;
        bytes32 name;
    }

    mapping(address => UserStruct) users;

    function addUser(bytes32 name) public {
        users[msg.sender] = UserStruct(msg.sender, name);
    }

    function getUser(
        address wallet
    ) public view returns (UserStruct memory company) {
        return users[wallet];
    }

    function getValue() public pure returns (bytes memory value) {
        return "Ola";
    }
}

contract Company {
    constructor() {
        companiesCount = 0;
        addCompany("main");
    }

    struct CompanyStruct {
        uint16 companyId;
        bytes32 name;
    }

    uint16 companiesCount;
    mapping(uint16 => CompanyStruct) companies;

    function addCompany(bytes32 name) public {
        companiesCount++;
        companies[companiesCount] = CompanyStruct(companiesCount, name);
    }

    function getCompany(
        uint16 companyId
    ) public view returns (CompanyStruct memory company) {
        return companies[companyId];
    }
}

contract UserCompanyLink {
    constructor() {
        addUserCompany(msg.sender, 0);
    }

    struct UserCompanyStruct {
        address wallet;
        uint16 companyId;
    }

    mapping(address => UserCompanyStruct) userCompanies;

    function addUserCompany(address wallet, uint16 companyId) public {
        userCompanies[wallet] = UserCompanyStruct(wallet, companyId);
    }
}

contract dApp is User, Company, UserCompanyLink {}
