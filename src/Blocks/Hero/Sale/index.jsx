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
import { ethers, BigNumber } from "ethers";


const TOTAL_POOL = 4;
const TOKEN = "0x01d4C5A517302609331094C56Cc8727640611667";
// const STAKING = "0x87CA5438671fb9b736A86CC4cA39d8FEF844625D";
// const STAKING = "0x523500fA5bBAC424DDFDc0171a9cC13Cc9C27731";
const STAKING = "0xa6897aE5B315d66C30AEFe1aF5cDc1251B4aA722"; // 1e18
const STAKE_AMOUNT = 100;


const Sale = ({ }) => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = (key) => { setOpen(true); setKey(key); };
  const handleClose = () => setOpen(false);

  const [open2, setOpen2] = React.useState(false);
  const handleOpen2 = (key) => { setOpen2(true); setKey(key); };
  const handleClose2 = () => setOpen2(false);

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
    console.log("Pool:", pool)
    fetchWalletData();
    const stakingContract = await getStakingContract();
    const tokenContract = await getTokenContract();
    if (!user[idx].available) {
      console.log("approve")
      await tokenContract["approve(address,uint256)"](STAKING, amount);
    } else {
      console.log("deposit")
      // const deposit_amount = ethers.BigNumber.from(amount*1e18)
      console.log("Bignumber")
      await stakingContract["deposit(uint256,uint256)"](idx, amount);
    }
    handleClose()
  };

  const withdraw = async (idx) => {
    fetchWalletData();
    const stakingContract = await getStakingContract();
    console.log("withdraw")
    try {
      await stakingContract["withdraw(uint256,uint256)"](idx, amount);
    } catch (e) {
      // const data = e.data;
      // const txHash = Object.keys(data)[0]; // TODO improve
      // const reason = data[txHash].reason;
      
      console.log(e.message); // prints "This is error message"
    }
    handleClose2()
  }

  const addpool = async () => {
    const stakingContract = await getStakingContract();
    console.log("start add pool:", stakingContract)
    const apy = 100;
    const lockday = 100;
    await stakingContract["add(address,address,uint256,uint256)"](TOKEN, TOKEN, 80, 20);
    console.log("end add pool")
  }

  return (
    <div style={{ width: "80%" }}>
      {/* <div><Grid>
        <Button onClick={() => addpool()}>AddPool</Button>
      </Grid></div> */}
      <Grid container spacing={5} columns={{ lg: 3, md: 3, sm: 1, xs: 1 }}>
        {pool.length && user.length && pool.map((tmp, idx) => {
          return (
            <Grid item lg={1} md={1} sm={1} xs={1}>
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
                    {/* <Grid itme xs={1}></Grid> */}
                    <Grid item xs={5}>
                      <Button onClick={() => handleOpen(idx)} className="hero-sale-section-brand-button">Stacking</Button>
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
                              <Button variant="contained" className="hero-sale-section-modal-button1" onClick={() => deposit(key)}>OK</Button>
                            </Grid>
                            <Grid item xs={2} />
                            <Grid item xs={4}>
                              <Button onClick={handleClose} variant="outlined" className="hero-sale-section-modal-button2">Cancel</Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Modal>
                    </Grid>
                    <Grid itme xs={2}></Grid>
                    <Grid item xs={5}>
                      <Button onClick={() => handleOpen2(idx)} className="hero-sale-section-brand-button">Withdraw</Button>
                      <Modal
                        open={open2}
                        onClose={handleClose2}
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
                              <Button variant="contained" className="hero-sale-section-modal-button1" onClick={() => withdraw(key)}>OK</Button>
                            </Grid>
                            <Grid item xs={2} />
                            <Grid item xs={4}>
                              <Button onClick={handleClose2} variant="outlined" className="hero-sale-section-modal-button2">Cancel</Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Modal>
                    </Grid>
                    {/* <Grid itme xs={1}></Grid> */}
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
            </Grid>)
        })}
      </Grid>
    </div>
  );
};

export default Sale;
