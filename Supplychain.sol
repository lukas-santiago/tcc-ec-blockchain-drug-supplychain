// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "../library/UnorderedKeySet/HitchensUnorderedKeySet.sol";

contract SupplychainProduct {
    using HitchensUnorderedKeySetLib for HitchensUnorderedKeySetLib.Set;
    HitchensUnorderedKeySetLib.Set resourceSet;

    string constant NOT_FOUND = "Not found.";

    struct ProductStruct {
        string id;
        string lotId;
        string name;
    }

    function parseStruct(
        ProductStruct memory resource,
        ProductStruct memory target
    ) public pure returns (bool) {
        target.id = resource.id;
        target.lotId = resource.lotId;
        target.name = resource.name;
        return true;
    }

    struct LogStruct {
        address sender;
        bytes32 key;
        ProductStruct base;
    }

    mapping(bytes32 => ProductStruct) resources;

    event LogAdd(LogStruct log);
    event LogUpdate(LogStruct log);
    event LogRemove(address sender, bytes32 key);

    function add(bytes32 key, ProductStruct memory resource) public {
        resourceSet.insert(key);
        ProductStruct storage w = resources[key];
        parseStruct(resource, w);
        emit LogAdd(LogStruct(msg.sender, key, w));
    }

    function update(bytes32 key, ProductStruct memory resource) public {
        require(resourceSet.exists(key), NOT_FOUND);
        ProductStruct storage w = resources[key];
        parseStruct(resource, w);
        emit LogUpdate(LogStruct(msg.sender, key, w));
    }

    function remove(bytes32 key) public {
        resourceSet.remove(key);
        delete resources[key];
        emit LogRemove(msg.sender, key);
    }

    function get(
        bytes32 key
    ) public view returns (ProductStruct memory resource) {
        require(resourceSet.exists(key), NOT_FOUND);
        ProductStruct storage w = resources[key];
        return w;
    }

    function getCount() public view returns (uint count) {
        return resourceSet.count();
    }

    function getAtIndex(uint index) public view returns (bytes32 key) {
        return resourceSet.keyAtIndex(index);
    }
}

// struct User {
//     string id;
//     string name;
//     string wallet;
//     string email;
//     string phoneNumber;
//     string cpf;
// }

// struct Role {
//     string id;
//     string codeName;
//     string displayName;
// }

// struct RoleUser {
//     string id;
//     string roleId;
//     string userId;
// }

// struct Place {
//     string id;
//     string displayName;
//     string cep;
//     string number;
// }

// struct Company {
//     string id;
//     string fullname;
//     string displayName;
//     string cnpj;
//     string companyCategoryId;
//     string placeId;
//     string responsibleId;
// }

// struct CompanyUser {
//     string id;
//     string companyId;
//     string userId;
// }

// struct CompanyCategory {
//     string id;
//     string codeName;
//     string displayName;
// }

// struct Product {
//     string id;
//     string lotId;
//     string name;
// }

// struct Lot {
//     string id;
//     string companyId;
// }

// struct History {
//     string id;
//     string lotId;
//     string sender;
//     string addressee;
// }
