import { expect } from "chai";
import { BigNumber } from "ethers";
import { createTokenId, parseTokenId } from "../../utils/parseTokenId";

describe("Test for utils functions", () => {
  const tokenID = "9490434390849790054731572076376116650519590089042247525170096698442617143872";
  const tokenAddress = "0x14fb65402700b823baf0c75f658509b0375fe5fd";
  const tokenIndex = BigNumber.from(118002);
  const tokenSupply = Number(1000000);

  it("Parse and create token Id", async () => {
      const [address, index, maxSupply] = parseTokenId(tokenID);
      expect(address).equal(tokenAddress);
      expect(index).equal(tokenIndex);
      expect(maxSupply).equal(tokenSupply);

      const newTokenId = createTokenId(address, index, maxSupply);
      expect(newTokenId).equal(tokenID);
  });
});
