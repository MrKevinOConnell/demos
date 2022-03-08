import {
  buildAndDeployApi,
  initTestEnvironment,
  stopTestEnvironment,
} from "@web3api/test-env-js";
import { Web3ApiClient } from "@web3api/client-js";
import path from "path";
import { providers } from "ethers";

import { getPlugins } from "./utils";

jest.setTimeout(300000);

describe("ENS Wrapper", () => {
  // We will have two clients because we need two
  // different signers in order to test ENS functions
  let ownerClient: Web3ApiClient;
  let ensUri: string;
  let ethersProvider: providers.JsonRpcProvider;
  let ensAddress: string;
  const SimpleStorageAddr = "0x0E696947A06550DEf604e82C26fd9E493e576337"


  const network: string = "testnet";

  beforeAll(async () => {
    const {
      ensAddress: ensRegistryAddress,
      ipfs,
      ethereum,
    } = await initTestEnvironment();

    // deploy api
    const apiPath: string = path.resolve(__dirname + "/../../");
    const api = await buildAndDeployApi(apiPath, ipfs, ensRegistryAddress);
    ensUri = `ens/testnet/${api.ensDomain}`;

    // set up ethers provider
    ethersProvider = providers.getDefaultProvider(
      "http://localhost:8546"
    ) as providers.JsonRpcProvider;
    ensAddress = ensRegistryAddress;

    // get client
    const plugins = getPlugins(ethereum, ipfs, ensRegistryAddress);
    ownerClient = new Web3ApiClient({ plugins });
  });

  afterAll(async () => {
    await stopTestEnvironment();
  });

  it("should get ipfs data", async () => {
    const variables = {
      address: SimpleStorageAddr,
      connection: {networkNameOrChainId: network},
    };

    const {
      data: registerData,
      errors: registerErrors,
    } = await ownerClient.query<{
      registerDomain: string;
    }>({
      uri: ensUri,
      query: `query {
       getIpfsData(
         address: $address
         connection: {
           networkNameOrChainId: $network
         }
        )
      }`,
      variables,
    });

    expect(registerData?.registerDomain).toBeDefined();
    expect(registerErrors).toBeUndefined();
  });
});
