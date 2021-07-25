import React, { useState, useEffect } from "react";
import { Contract, getDefaultProvider, providers, utils } from "ethers";
import { config } from "../config";
import abi from "../fixtures/abi.json";
import axios from "axios";

//background svg
import background from "./img/hex.svg";

const provider = getDefaultProvider("rinkeby", { alchemy: config.alchemyKey });
const contract = new Contract(
  "0x108f24eb4953B96117374878E07cCE918992Ea0C",
  abi,
  provider
);

const formatIpfsUrl = (url) => {
  return url.replace(/ipfs:\/\//g, "https://cloudflare-ipfs.com/");
};

/*
// unsure how to set this up to enable the Boolean operation in line 80
class ControlButton extends React.Component {
  constructor(id) {
    super(id);
    this.id = 7;
  }
}
*/

export const HomePage = () => {  

  const [mintedNftState, setMintedNftState] = useState({
    state: "UNINITIALIZED",
  });
  const [purchaseState, setPurchaseState] = useState({
    state: "UNINITIALIZED",
  });
  const modalVisible =
    purchaseState.state === "PENDING_METAMASK" ||
    purchaseState.state === "PENDING_SIGNER" ||
    purchaseState.state === "PENDING_CONFIRMAION";

  const loadRobotsData = async () => {
    setMintedNftState({
      state: "PENDING",
    });
  
    const totalSupply = await contract.totalSupply();
  
    const ids = [...Array(totalSupply.toNumber()).keys()];

    const deferredData = ids.map(async (id) => {
      const ipfsUri = await contract.tokenURI(id);
      const owner = await contract.ownerOf(id);
      const formattedUri = formatIpfsUrl(ipfsUri);
      const metadata = (await axios.get(formattedUri)).data;
      const formattedImage = formatIpfsUrl(metadata.image);
      return {
        id,
        name: metadata.name,
        image: formattedImage,
        description: metadata.description,
        owner,
      };
    });

    const data = await Promise.all(deferredData);
  
    setMintedNftState({
      state: "SUCCESS",
      data,
    });
  };
  
  useEffect(() => {
    loadRobotsData();
  }, []);

  // Boolean toggle to disable minting button at a designated NFT ID (lines 127-149)
  const [reachMax] = React.useState( contract.ownerOf.id === undefined );

  const handlePurchase = async () => {
    const { ethereum } = window;
    if (typeof ethereum == "undefined") alert("Metamask not detected");

    // Prompts Metamask to connect
    setPurchaseState({ state: "PENDING_METAMASK" });
    await ethereum.enable();

    // Create new provider from Metamask
    const provider = new providers.Web3Provider(window.ethereum);

    // Get the signer from Metamask
    const signer = provider.getSigner();

    // Create the contract instance
    const contract = new Contract(
      "0x108f24eb4953B96117374878E07cCE918992Ea0C",
      abi,
      signer
    );

    // Call the purchase method
    setPurchaseState({ state: "PENDING_SIGNER" });
    const receipt = await contract.purchase({ value: utils.parseEther("1") });
    setPurchaseState({ state: "PENDING_CONFIRMAION" });
    const transaction = await receipt.wait();
    setPurchaseState({ state: "SUCCESS", transaction });

    // Reload the Robots
    await loadRobotsData();
  };

  return (
    <div style={{ backgroundImage: `url(${background})` }}>
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="text-yellow-500 font-bold text-8xl pt-10 text-shadow-lg">
            Marköbots
        </div>

      <div className="text-gray-600 text-2xl pt-3 text-shadow-sm"
        >
        Truly unique NFTs for your awesome collection
      </div>
      
      <div>{(reachMax && 
        <div className="mt-8 mb-16">
          <button 
            type="button"
            className="inline-flex items-center px-16 py-3 border border-transparent text-base font-large elevation-15 rounded-md text-white bg-green-600
               hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" 
            onClick={handlePurchase}
          >
            Mint me a Marköbot!
          </button>
        </div>)
        ||
        (<div className="mt-8 mb-16">
          <button
            type="button"
            className="items-center px-16 py-3 border border-transparent text-base font-large elevation-15 rounded-md text-gray-200 bg-gray-400"
            disabled='true'
          >
            All Marköbots have been minted!<br/>
            Watch this space for more!
          </button>
        </div>)}
      </div>

        {mintedNftState.state === "PENDING" && (
          <div className="text-xl text-black">loading...</div>
        )}
        
        {mintedNftState.state === "SUCCESS" && (
          <div className="grid grid-cols-4 gap-12">
            {mintedNftState.data.map(
              ({ id, image, name, description, owner }) => {
                return (
                  <div key={id} className="bg-white rounded p-2 elevation-20">
                    <img src={image} className="mx-auto p-3" alt={name} />
                    <div className="text-xl">{name}</div>
                    <div className="text-red-600">{description}</div>
                    <hr className="my-4" />
                    <div className="text-left text-s">
                      Exclusively Owned By:
                    </div>
                    <div className="truncate text-left text-xs">{owner}</div>
                  </div>
                );
              }
            )}
          </div>
        )}{" "}
        <br></br>
      </div>

      {modalVisible && (
        <div
          className="fixed z-10 inset-0 overflow-y-auto"
          aria-labelledby="modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-backdrop"
            onClick={() => {
              // close modal when outside of modal is clicked
              window.location.reload(false);
            }}
          >
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                aria-hidden="true"
              />
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              ></span>
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-title"
                    >
                      {purchaseState.state === "PENDING_METAMASK" &&
                        "Connecting with Metamask ..."}
                      {purchaseState.state === "PENDING_SIGNER" &&
                        "Waiting for transaction to be signed ..."}
                      {purchaseState.state === "PENDING_CONFIRMAION" &&
                        "Waiting for block confirmation ..."}
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {purchaseState.state === "PENDING_METAMASK" &&
                          "Allow Metamask to connect to this application in the extension. Click anywhere if you wish to stop the process."}
                        {purchaseState.state === "PENDING_SIGNER" &&
                          "Approve the purchase transaction within the Metamask extension. Click anywhere if you wish to stop the process."}
                        {purchaseState.state === "PENDING_CONFIRMAION" &&
                          "Transaction has been sent to the blockchain. Please wait while the transaction is being confirmed. Click anywhere if you wish to stop the process."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
