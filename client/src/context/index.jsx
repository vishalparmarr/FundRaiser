import React, { useContext, createContext } from 'react';
import {contractAddress} from '../abis/contract-address.json';
import {abi} from '../abis/contractAbi.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useConnect } from "@thirdweb-dev/react";

import { useAddress, useContract, useContractWrite } from '@thirdweb-dev/react';
import { ethers } from 'ethers';

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract(contractAddress,abi);
  const { mutateAsync: createCampaign } = useContractWrite(contract, 'createCampaign');

  const address = useAddress();
  const connect = useConnect();

  const publishCampaign = async (form) => {
    try {
      const data = await createCampaign({args:[
        address, // owner
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime() , // deadline,
        form.image
      ]})
      
      toast.success('Campaign created successfully.');
      console.log("contract call success", data)
    } catch (error) {
      toast.error('Error while creating Campaign, please try again');
      console.log("contract call failure", error)
    }
  }

  const updateCampaign = async (form) => {
    try {
      const data = await contract.call('updateCampaign', [
        form.id, // campaign id
        form.title, // title
        form.description, // description
        form.target,
        new Date(form.deadline).getTime() , // deadline,
        form.image
      ])
      toast.success('Campaign updated successfully.');
      console.log("contract call success", data)
    } catch (error) {
      toast.error('Error while creating Campaign, please try again');
      console.log("contract call failure", error)
    }
  }

  const deleteCampaign = async (pId) => {
    try {
      const data = await contract.call('deleteCampaign', [pId])
      
      toast.success('Campaign deleted successfully.');
      console.log("contract call success", data)
      return data;
    } catch (error) {
      toast.error('Error while deleting Campaign, please try again');
      console.log("contract call failure", error)
    }
  }

  const getCampaigns = async () => {
    const campaigns = await contract.call('getCampaigns');

    const parsedCampaings = campaigns.map((campaign, i) => ({
      owner: campaign.owner,
      title: campaign.title,
      description: campaign.description,
      target: ethers.utils.formatEther(campaign.target.toString()),
      deadline: campaign.deadline.toNumber(),
      amountCollected: ethers.utils.formatEther(campaign.amountCollected.toString()),
      image: campaign.image,
      pId: i
    }));

    return parsedCampaings;
  }

  const getUserCampaigns = async () => {
    const allCampaigns = await getCampaigns();

    const filteredCampaigns = allCampaigns.filter((campaign) => campaign.owner === address);

    return filteredCampaigns;
  }

  const donate = async (pId, amount) => {
    try{
      const data = await contract.call('donateToCampaign', [pId], { value: ethers.utils.parseEther(amount)});
      toast.success('Campaign funded successfully. Thansk for your collaboration');
      return data;
    } catch (err) {
      console.log("Error occured while making donation", err);
    }
  }

  const payOutToCampaignTeam = async (pId) => {
    try {
      const data = await contract.call('payOutToCampaignTeam', [pId]);
      toast.success('Campaign funds successfully withdrawed.');
      return data;
    } catch(err) {
      toast.error("Error occured while withdrawing funds.");
      console.log("Error occured while withdrawing funds", err);
    }
  }

  const getDonations = async (pId) => {
    const donations = await contract.call('getDonators', [pId]);
    const numberOfDonations = donations[0].length;

    const parsedDonations = [];

    for(let i = 0; i < numberOfDonations; i++) {
      parsedDonations.push({
        donator: donations[0][i],
        donation: ethers.utils.formatEther(donations[1][i].toString())
      })
    }

    return parsedDonations;
  }

  return (
    <StateContext.Provider
      value={{ 
        address,
        contract,
        connect,
        createCampaign: publishCampaign,
        getCampaigns,
        getUserCampaigns,
        donate,
        getDonations,
        payOutToCampaignTeam,
        updateCampaign,
        deleteCampaign,
      }}
    >
      <ToastContainer />
      {children}
    </StateContext.Provider>
  )
}

export const useStateContext = () => useContext(StateContext);