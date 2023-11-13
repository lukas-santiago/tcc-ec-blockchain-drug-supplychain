// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/access/AccessControl.sol";

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

    // User
    struct UserModel {
        bool registered;
        address _address;
        uint16[] comanyIds;
    }
    mapping(address => UserModel) public users;

    function register() public {
        UserModel storage user = users[msg.sender];
        require(user.registered == false, "User is already registered.");
        user.registered = true;
        user._address = msg.sender;
    }

    function grantRole(
        bytes32 role,
        address account
    ) public virtual override onlyRole(getRoleAdmin(role)) {
        super.grantRole(role, account);
    }

    // TODO: Implementar a lógica da gestão de empresa
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

    function addCompany(
        CompanyModel memory company
    ) public onlyRole(COMPANY_ROLE) {
        companiesCount++;

        companies[companiesCount] = CompanyModel(
            companiesCount,
            company.name,
            company.companyType,
            true
        );
    }

    function editCompany(
        CompanyModel memory company
    ) public onlyRole(COMPANY_ROLE) {
        companies[company.companyId].name = company.name;
        companies[company.companyId].companyType = company.companyType;
    }

    function disableCompany(uint16 companyId) public onlyRole(COMPANY_ROLE) {
        companies[companyId].active = false;
    }
    // TODO: Implementar a lógica da gestão de catalogo
    // TODO: Implementar a lógica da gestão de lote
    // TODO: Implementar a lógica da movimentação de lote
    // TODO: Implementar a lógica do rastro de atividade
}
