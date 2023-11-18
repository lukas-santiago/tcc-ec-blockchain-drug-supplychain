import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import { SupplyChainDApp__factory, Models } from "../types";

export function encodeBytesNString(text: string, nBytes: number): string {
  const bytes = ethers.toUtf8Bytes(text);
  if (bytes.length > nBytes - 1) {
    throw new Error("bytes" + nBytes + " string must be less than " + nBytes + " bytes");
  }
  return ethers.zeroPadBytes(bytes, nBytes);
}

async function deployContractFixture(middlewares: any = []) {
  const [owner] = await ethers.getSigners();
  const dAppCotract = await new SupplyChainDApp__factory(owner).deploy();

  for await (const middleware of middlewares) {
    await middleware(dAppCotract, owner);
  }
  return {
    dAppCotract,
    owner,
  };
}

describe("SupplyChainDApp", async function () {
  let fixturePromise = loadFixture(deployContractFixture);

  describe("User", async function () {
    it("register user", async function () {
      const { dAppCotract, owner } = await fixturePromise;

      try {
        await dAppCotract.register();
        await dAppCotract.getEvent("UserRegistered");
        let companyRole = await dAppCotract.COMPANY_ROLE();
        await dAppCotract.grantRole(companyRole, owner);
        await dAppCotract.getEvent("RoleGranted(bytes32,address)");
        await dAppCotract.addCompany(encodeBytesNString("test", 32), true, true);
        await dAppCotract.getEvent("CompanyRegistered");

        console.log(await dAppCotract.me());
      } catch (error) {
        console.error(error);
      }

      // expect().deep.equal(Object.values(model));
    });
  });
});
