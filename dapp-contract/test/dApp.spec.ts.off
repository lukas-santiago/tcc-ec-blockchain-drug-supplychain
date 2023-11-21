import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { DApp__factory, Models } from '../types';

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


describe("dApp", async function () {
    let fixturePromise = loadFixture(deployContractFixture)
    describe("Company", async function () {
        it("addCompany", async function () {
            const { dAppCotract } = await fixturePromise;

            const count = await dAppCotract.companiesCount();

            const model: any = {
                companyId: BigInt(Number(count) + 1),
                companyName: encodeBytesNString('company name', 32),
                companyType: {
                    isManufacture: true,
                    isIntermediate: false,
                    isEndPoint: false,
                },
                active: true
            }

            await dAppCotract.addCompany(model.companyName, model.companyType)
            const data = await dAppCotract.companies(model.companyId);

            model.companyType = Object.values(model.companyType)

            expect(data).deep.equal(Object.values(model));

        })
        it("editCompanyName", async function () {
            const { dAppCotract } = await fixturePromise;

            const count = await dAppCotract.companiesCount();
            expect(count).not.equal(BigInt(0));

            const model: any = {
                companyId: BigInt(1),
                companyName: encodeBytesNString('changed', 32),
                companyType: {
                    isManufacture: true,
                    isIntermediate: false,
                    isEndPoint: false,
                },
                active: true
            }

            await dAppCotract.editCompanyName(model.companyId, model.companyName)

            const data = await dAppCotract.companies(model.companyId);
            model.companyType = Object.values(model.companyType)

            expect(data).deep.equal(Object.values(model));
        })
        it("disableCompany", async function () {
            const { dAppCotract } = await fixturePromise;

            const count = await dAppCotract.companiesCount();
            expect(count).not.equal(BigInt(0));

            const model: any = {
                companyId: BigInt(1),
                companyName: encodeBytesNString('changed', 32),
                companyType: {
                    isManufacture: true,
                    isIntermediate: false,
                    isEndPoint: false,
                },
                active: false
            }

            await dAppCotract.disableCompany(model.companyId)

            const data = await dAppCotract.companies(model.companyId);
            model.companyType = Object.values(model.companyType)

            expect(data).deep.equal(Object.values(model));
        })
    })
    describe("Catalog", async function () {
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
        it("editCatalog", async function () {
            const { dAppCotract } = await fixturePromise;
            // Expect the count to > 0
            const count = await dAppCotract.catalogCount();
            expect(count).not.equal(BigInt(0));

            const model = {
                catalogId: BigInt(1),
                companyId: BigInt(1),
                productName: encodeBytesNString('changed', 32),
                active: true
            }

            await dAppCotract.editCatalogName(model.catalogId, model.productName)
            const data = await dAppCotract.catalogs(model.catalogId);
            expect(data).deep.equal(Object.values(model));
        })
        it("disableCatalog", async function () {
            const { dAppCotract } = await fixturePromise;
            // Expect the count to > 0
            const count = await dAppCotract.catalogCount();
            expect(count).not.equal(BigInt(0));

            const model = {
                catalogId: BigInt(1),
                companyId: BigInt(1),
                productName: encodeBytesNString('changed', 32),
                active: false
            }
            await dAppCotract.disableCatalog(model.catalogId)
            const data = await dAppCotract.catalogs(model.catalogId);
            expect(data).deep.equal(Object.values(model));
        })
        it("addCatalog - with false companyId", async function () {
            const { dAppCotract } = await fixturePromise;

            const count = await dAppCotract.catalogCount();

            const model = {
                catalogId: BigInt(Number(count) + 1),
                companyId: BigInt(15),
                productName: encodeBytesNString('name', 32),
                active: true
            }

            expect(dAppCotract.addCatalog(model.companyId, model.productName)).to.be.revertedWith('invalid company id');
        })
    })
})
