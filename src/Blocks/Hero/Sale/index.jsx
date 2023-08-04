import React, { useState, useEffect } from "react";

import "./style.css";
import logoToken from "../../../assets/img/background-logo.png";
import Icon from "../../../components/Icon";
import { Button, Grid } from "@mui/material";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';

import abi from "../../../abi/Staking.json";
import TokenABI from "../../../abi/MockERC20.json";
import useContract from "../../../hooks/useContract";
import { ethers } from "ethers";


const TOTAL_POOL = 3;
const TOKEN = "0x01d4C5A517302609331094C56Cc8727640611667";
const STAKING = "0xAe292034ce76827de9927FB4259A0Fd10344f02c";
const STAKE_AMOUNT = 100;


const Sale = ({ }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = (key) => {setOpen(true); setKey(key);};
  const handleClose = () => setOpen(false);

  const { getContract } = useContract();

  const [pool, setPool] = useState([]);
  const [key, setKey] = useState([]);
  const [user, setUser] = useState([]);
  const [amount, setAmount] = useState([]);
  const getStakingContract = async () => await getContract(STAKING, abi);

  const getTokenContract = async () => await getContract(TOKEN, TokenABI);

  // const dir = useBreakpointValue({ base: "column", md: "row" });

  const fetchPoolInfo = async () => {
    const stakingContract = await getStakingContract();
    let poolArray = [];
    for (let i = 0; i < TOTAL_POOL; i++) {
      const pool = await stakingContract["poolInfo(uint256)"](i);
      const tmpPool = {
        depositToken: pool[0],
        rewardToken: pool[1],
        depositedAmount: Number(pool[2]),
        apy: Number(pool[3]),
        lockDays: Number(pool[4]),
      };
      poolArray.push(tmpPool);
    }
    setPool(poolArray);
  };

  const setAmountValue = async (event) => {
    setAmount(event.target.value);
  }
  const fetchUserInfo = async (address) => {
    const stakingContract = await getStakingContract();
    const tokenContract = await getTokenContract();
    const allowAmount = await tokenContract["allowance(address,address)"](
      address,
      STAKING
    );
    console.log(allowAmount > STAKE_AMOUNT);
    let userArray = [];
    for (let i = 0; i < TOTAL_POOL; i++) {
      const user = await stakingContract["userDetail(uint256,address)"](
        i,
        address
      );
      const reward = await stakingContract["pendingReward(uint256,address)"](
        i,
        address
      );
      const tmpUser = {
        amount: Number(user[0]),
        lastRewardAt: Number(user[1]),
        lockUntil: Number(user[2]),
        pendingReward: Number(reward),
        available: allowAmount > STAKE_AMOUNT,
      };
      userArray.push(tmpUser);
    }
    setUser(userArray);
  };

  async function fetchWalletData() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const network = await provider.getNetwork();
        if (Number(network.chainId) !== 11155111) {
          throw new Error("Please configure MetaMask for Sepolia ETH Chain");
        }
        const signer = await provider.getSigner();
        const walletAddress = await signer.getAddress();
        fetchPoolInfo();
        fetchUserInfo(walletAddress);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.error("MetaMask not detected");
    }
  }
  useEffect(() => {
    fetchWalletData();
  }, []);

  const deposit = async (idx) => {
    fetchWalletData();
    const stakingContract = await getStakingContract();
    const tokenContract = await getTokenContract();
    if (!user[idx].available) {
      console.log("approve")
      await tokenContract["approve(address,uint256)"](STAKING, amount);
    } else {
      console.log("deposit")
      await stakingContract["deposit(uint256,uint256)"](idx, amount);
    }
  };

  return (
    pool.length && user.length && pool.map((tmp, idx) => {
      return (
        <div className="hero-sale-container-outer" key={idx}>
          <div className="hero-sale-container">
            <Grid container>
              <Grid item xs={6}>
                <Icon
                  imgsrc={logoToken}
                  classnamestyle="hero-sale-section-brand-logo hover-effect"
                />
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <h2>ArmorAI</h2>
                <p>Will be locked</p>
                <span className="hero-sale-section-brand-tag">{`${tmp.lockDays} days`}</span>
              </Grid>
              <Grid item xs={6}>
                Current APY:
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                {`${tmp.apy}%`}
              </Grid>
              <Grid item xs={6}>
                Earn
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <b>Armor</b>
              </Grid>

              <Grid item xs={12}>
                <Button onClick={()=>handleOpen(idx)} className="hero-sale-section-brand-button">Enable Stacking</Button>
                <Modal
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="modal-modal-title"
                  aria-describedby="modal-modal-description"
                >
                  <Box className="amount-modal">
                    <Grid container>
                      <Grid item xs={12} style={{ textAlign: 'center' }}>
                        Amount
                      </Grid>
                      <Grid item xs={12}>
                        <TextField style={{ width: "100%" }} id="outlined-basic" variant="outlined" inputProps={{ type: 'number' }} onChange={setAmountValue} />
                      </Grid>
                      <Grid item xs={1} />
                      <Grid item xs={4}>
                        <Button variant="contained" className="hero-sale-section-modal-button1" onClick={() => deposit(key) }>OK</Button>
                      </Grid>
                      <Grid item xs={2} />
                      <Grid item xs={4}>
                        <Button onClick={handleClose} variant="outlined" className="hero-sale-section-modal-button2">Cancel</Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Modal>
              </Grid>
              <Grid item xs={6}>
                You Stacked
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                {`${user[idx].amount} ARMOR`}
              </Grid>
              <Grid item xs={6}>
                Your Reward
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                <b>{`${user[idx].pendingReward} ARMOR`}</b>
              </Grid>
              <Grid item xs={6}>
                Total Stacked in Pool
              </Grid>
              <Grid item xs={6} style={{ textAlign: 'right' }}>
                {`${tmp.depositedAmount} ARMR`}
              </Grid>
            </Grid>
          </div>
        </div>
      )
    })
  );
};

export default Sale;
