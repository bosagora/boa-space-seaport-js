import { ethers } from "hardhat";
import { Seaport } from "../../seaport";
import type {
  TestERC721,
  TestERC20,
  TestERC1155,
  Seaport as SeaportContract,
  DomainRegistry,
} from "../../typechain";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import sinonChai from "sinon-chai";
import {AssetContractShared, SharedStorefrontLazyMintAdapter, WBOA9} from "../../typechain";

chai.use(chaiAsPromised);
chai.use(sinonChai);

type Fixture = {
  seaportContract: SeaportContract;
  seaport: Seaport;
  domainRegistry: DomainRegistry;
  testErc721: TestERC721;
  testErc20: TestERC20;
  testErc1155: TestERC1155;
};

export const describeWithFixture = (
  name: string,
  suiteCb: (fixture: Fixture) => unknown
) => {
  describe(name, () => {
    const fixture: Partial<Fixture> = {};

    beforeEach(async () => {
      const SeaportFactory = await ethers.getContractFactory("Seaport");

      const ConduitControllerFactory = await ethers.getContractFactory(
        "ConduitController"
      );

      const conduitController = await ConduitControllerFactory.deploy();

      const seaportContract = await SeaportFactory.deploy(
        conduitController.address
      );

      await seaportContract.deployed();

      const DomainRegistryFactory = await ethers.getContractFactory(
        "DomainRegistry"
      );
      const domainRegistry = await DomainRegistryFactory.deploy();
      await domainRegistry.deployed();

      const seaport = new Seaport(ethers.provider, {
        overrides: {
          contractAddress: seaportContract.address,
          domainRegistryAddress: domainRegistry.address,
        },
      });

      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const testErc721 = await TestERC721.deploy();
      await testErc721.deployed();

      const TestERC1155 = await ethers.getContractFactory("TestERC1155");
      const testErc1155 = await TestERC1155.deploy();
      await testErc1155.deployed();

      const TestERC20 = await ethers.getContractFactory("TestERC20");
      const testErc20 = await TestERC20.deploy();
      await testErc20.deployed();

      // In order for cb to get the correct fixture values we have
      // to pass a reference to an object that you we mutate.
      fixture.seaportContract = seaportContract;
      fixture.seaport = seaport;
      fixture.domainRegistry = domainRegistry;
      fixture.testErc721 = testErc721;
      fixture.testErc1155 = testErc1155;
      fixture.testErc20 = testErc20;
    });

    suiteCb(fixture as Fixture);
  });
};

export const describeWithContractsCreation = (
    name: string,
    suiteCb: (fixture: Fixture) => unknown
) => {
  describe(name, () => {
    const fixture: Partial<Fixture> = {};
    const ZeroAddress = "0x0000000000000000000000000000000000000000";

    beforeEach(async () => {
      const [offerer, zone, fulfiller, admin] = await ethers.getSigners();
      const SeaportFactory = await ethers.getContractFactory("Seaport");

      const ConduitControllerFactory = await ethers.getContractFactory(
          "ConduitController"
      );

      const conduitController = await ConduitControllerFactory.deploy();

      const seaportContract = await SeaportFactory.deploy(
          conduitController.address
      );

      await seaportContract.deployed();

      const DomainRegistryFactory = await ethers.getContractFactory(
          "DomainRegistry"
      );
      const domainRegistry = await DomainRegistryFactory.deploy();
      await domainRegistry.deployed();

      // Deploy AssetContractShared contract
      const name = "BOASPACE Collections";
      const symbol = "BOASPACESTORE";
      const templateURI = "";
      const assetTokenFactory = await ethers.getContractFactory(
          "AssetContractShared"
      );
      const assetToken = (await assetTokenFactory
          .connect(admin)
          .deploy(
              name,
              symbol,
              ethers.constants.AddressZero,
              templateURI,
              ethers.constants.AddressZero
          )) as AssetContractShared;
      await assetToken.deployed();

      // Deploy SharedStorefrontLazyMintAdapter contract
      const lazyMintAdapterFactory = await ethers.getContractFactory(
          "SharedStorefrontLazyMintAdapter"
      );
      const lazyMintAdapter = (await lazyMintAdapterFactory
          .connect(admin)
          .deploy(
              seaportContract.address,
              ZeroAddress,
              assetToken.address
          )) as SharedStorefrontLazyMintAdapter;

      // set the shared proxy of assetToken to SharedStorefrontLazyMintAdapter
      await assetToken.connect(admin).addSharedProxyAddress(lazyMintAdapter.address);

      // Deploy WBOA9 contract
      const wboa9Factory = await ethers.getContractFactory("WBOA9");
      const wboaToken = (await wboa9Factory.connect(admin).deploy()) as WBOA9;

      const seaport = new Seaport(ethers.provider, {
        overrides: {
          contractAddress: seaportContract.address,
          lazymintAdapterAddress: lazyMintAdapter.address,
          assetTokenAddress: assetToken.address,
          wboaTokenAddress: wboaToken.address,
          domainRegistryAddress: domainRegistry.address,
        },
      });

      const TestERC721 = await ethers.getContractFactory("TestERC721");
      const testErc721 = await TestERC721.deploy();
      await testErc721.deployed();

      const TestERC1155 = await ethers.getContractFactory("TestERC1155");
      const testErc1155 = await TestERC1155.deploy();
      await testErc1155.deployed();

      const TestERC20 = await ethers.getContractFactory("TestERC20");
      const testErc20 = await TestERC20.deploy();
      await testErc20.deployed();

      // In order for cb to get the correct fixture values we have
      // to pass a reference to an object that you we mutate.
      fixture.seaportContract = seaportContract;
      fixture.seaport = seaport;
      fixture.domainRegistry = domainRegistry;
      fixture.testErc721 = testErc721;
      fixture.testErc1155 = testErc1155;
      fixture.testErc20 = testErc20;
    });

    suiteCb(fixture as Fixture);
  });
};

