import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { DApp__factory, ManufacturerCompany } from '../types';


export function encodeBytesNString(text: string, nBytes: number): string {
    const bytes = ethers.toUtf8Bytes(text);
    if (bytes.length > nBytes - 1) { throw new Error("bytes" + nBytes + " string must be less than " + nBytes + " bytes"); }
    return ethers.zeroPadBytes(bytes, nBytes);
}


async function deployContractFixture() {
    const [owner] = await ethers.getSigners();
    const dAppCotract = await new DApp__factory(owner).deploy()

    return {
        dAppCotract,
        owner
    }
}


describe("CompanyOwner", async function () {
    describe("metadata", async function () { })
    describe("functions", async function () {
        let fixturePromise = loadFixture(deployContractFixture)

        it("addCatalog", async function () {
            const { dAppCotract } = await fixturePromise;

            const count = await dAppCotract.catalogCount();

            const model = {
                catalogId: BigInt(Number(count) + 1),
                companyId: BigInt(1),
                productName: encodeBytesNString('name', 32),
                active: true
            }

            await dAppCotract.addCatalog(model.companyId, model.productName)
            const data = await dAppCotract.catalogs(model.catalogId);
            expect(data).deep.equal(Object.values(model));
        })


    })
})
