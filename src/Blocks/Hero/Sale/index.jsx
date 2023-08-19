import React, { useState, useEffect } from "react";

import "./style.css";
import logoToken from "../../../assets/img/background-logo.png";
import Icon from "../../../components/Icon";
import { Button, Grid } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import { CircularProgress } from "@mui/material";

import abi from "../../../abi/Staking.json";
import TokenABI from "../../../abi/MockERC20.json";
import useContract from "../../../hooks/useContract";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import BigNumber from "big-number";
import { BigNumber as BG } from "ethers";



const TOKEN = "0x01d4C5A517302609331094C56Cc8727640611667";
// const STAKING = "0x87CA5438671fb9b736A86CC4cA39d8FEF844625D";
// const STAKING = "0x523500fA5bBAC424DDFDc0171a9cC13Cc9C27731";
// const STAKING = "0xa6897aE5B315d66C30AEFe1aF5cDc1251B4aA722"; // 1e18
const STAKING = "0xdeed8EEb5B129E8ACa764FC5Bf9e9f85df35a168";
const STAKE_AMOUNT = 100;
let decimals = BigNumber(10).pow(15);
// let mid_decimals = BigNumber(10).pow(15);

const Sale = ({ isWalletOpen, connectedStatus }) => {

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
  const [depositLoading, setDepositLoading] = React.useState(false);
  const getStakingContract = async () => await getContract(STAKING, abi);

  const getTokenContract = async () => await getContract(TOKEN, TokenABI);

  // const dir = useBreakpointValue({ base: "column", md: "row" });

  const fetchPoolInfo = async () => {
    let poolArray = [];
    
    if (isWalletOpen) {
      const stakingContract = await getStakingContract();
      const TOTAL_POOL = await stakingContract["poolCount()"]();
      for (let i = 0; i < TOTAL_POOL; i++) {
        const pool = await stakingContract["poolInfo(uint256)"](i);
        const tmpPool = {
          depositToken: pool[0],
          rewardToken: pool[1],
          depositedAmount: BigNumber(Number(pool[2])).divide(decimals),
          apy: Number(pool[3]),
          lockDays: Number(pool[4]),
        };
        poolArray.push(tmpPool);
      }
    }
    setPool(poolArray);
  };

  const setAmountValue = async (event) => {
    setAmount(event.target.value * 1);
    console.log(event.target.value);
  }

  const fetchUserInfo = async (address) => {
    let userArray = [];
    if (isWalletOpen) {
      const stakingContract = await getStakingContract();
      const tokenContract = await getTokenContract();
      const allowAmount = await tokenContract["allowance(address,address)"](
        address,
        STAKING
      );
      // console.log(1111, amount)
      // console.log(11112, allowAmount)
      // console.log(allowAmount > amount);
      // console.log("before poolcount")
      const TOTAL_POOL = Number(await stakingContract["poolCount()"]());
      // console.log("TOTAL_POOL = ", TOTAL_POOL)
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
          amount: BigNumber(Number(user[0])).divide(decimals),
          lastRewardAt: Number(user[1]),
          lockUntil: Number(user[2]),
          pendingReward: BigNumber(Number(reward)).divide(decimals),
          available: allowAmount > amount,
        };
        userArray.push(tmpUser);
      }
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

    // console.log("type: ", typeof amount);
    const A_amount = amount * 1000;
    const mid_decimals = BG.from(10).pow(15);
    const N_amount = mid_decimals.mul(A_amount);
    // console.log("N_amount: ", N_amount);


    // const N_amount = BigNumber(A_amount).multiply(mid_decimals);
    // const F_amount = Number(N_amount.toString());
    // const H_amount = BG.from(F_amount);
    // console.log("F_amount: ", typeof F_amount);

    if (!user[idx].available) {
      console.log("approve")
      try {
        await tokenContract["approve(address,uint256)"](STAKING, N_amount);
      } catch (e) {
        console.log("approve error: ", e.code)
        toast.error('Approve Error');
      }
    } else {
      console.log("deposit")
      try {
        await stakingContract["deposit(uint256,uint256)"](idx, N_amount);
        setDepositLoading(false);
        toast("Staked");
      } catch (e) {
        console.log("deposit error: ", e.code)
        toast.error('Deposit Error');
      }
    }
    handleClose();
  };

  const withdraw = async (idx) => {
    fetchWalletData();
    const stakingContract = await getStakingContract();
    console.log("withdraw");

    const A_amount = amount * 1000;
    const mid_decimals = BG.from(10).pow(15);
    const N_amount = mid_decimals.mul(A_amount);

    try {
      await stakingContract["withdraw(uint256,uint256)"](idx, N_amount);
    } catch (e) {
      console.log("withdraw error: ", e.message);
      toast.error('Withdraw Error');
    }
    handleClose2()
  }

  const addpool = async () => {
    const stakingContract = await getStakingContract();
    console.log("start add pool:", stakingContract)
    const apy = 100;
    const lockday = 100;
    await stakingContract["add(address,address,uint256,uint256)"](TOKEN, TOKEN, 15, 21);
    console.log("end add pool")
  }

  return (
    <div style={{ width: "95%" }}>
      {/* <div><Grid>
        <Button onClick={() => addpool()}>AddPool</Button>
      </Grid></div> */}
      <Grid container spacing={12} >
        {connectedStatus && pool.length && user.length && pool.map((tmp, idx) => {
          return (
            <Grid item xs={12} sm={6} lg={4} xl={3}>
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
                      <Button onClick={() => {
                        handleOpen(idx);
                        setDepositLoading(false);
                      }} className="hero-sale-section-brand-button">Stake</Button>
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
                              <TextField style={{ width: "100%" }} id="outlined-basic" variant="outlined" inputProps={{ type: 'number', pattern: '[0-9]*.?[0-9]+', step: 0.1 }} onChange={setAmountValue} />
                            </Grid>
                            <Grid item xs={1} />
                            <Grid item xs={4}>
                              <LoadingButton
                                variant="contained"
                                className="hero-sale-section-modal-button1"
                                color="secondary"
                                loading={depositLoading}
                                loadingIndicator={
                                  <CircularProgress color="secondary" size={20} />
                                }
                                onClick={() => {
                                  setDepositLoading(true);
                                  deposit(key);
                                }}>
                                Stake
                              </LoadingButton>
                            </Grid>
                            <Grid item xs={2} />
                            <Grid item xs={4}>
                              <Button onClick={handleClose} variant="outlined" color="error" className="hero-sale-section-modal-button1">Cancel</Button>
                            </Grid>
                          </Grid>
                        </Box>
                      </Modal>
                    </Grid>
                    <Grid itme xs={2}></Grid>
                    <Grid item xs={5}>
                      <Button onClick={() => {
                        handleOpen2(idx);
                        setDepositLoading(false);
                      }} className="hero-sale-section-brand-button">Withdraw</Button>
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
                              <TextField style={{ width: "100%" }} id="outlined-basic" variant="outlined" inputProps={{ type: 'number', pattern: '[0-9]*.?[0-9]+', step: 0.1 }} onChange={setAmountValue} />
                            </Grid>
                            <Grid item xs={1} />
                            <Grid item xs={4}>
                              <LoadingButton
                                variant="contained"
                                className="hero-sale-section-modal-button1"
                                loading={depositLoading}
                                loadingIndicator={
                                  <CircularProgress color="success" size={20} />
                                }
                                onClick={() => {
                                  setDepositLoading(true);
                                  withdraw(key);
                                }}>
                                Withdraw
                              </LoadingButton>
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
                      You Staked
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                      {`${user[idx].amount/1000} ARMOR`}
                    </Grid>
                    <Grid item xs={6}>
                      Your Reward
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                      <b>{`${user[idx].pendingReward/1000} ARMOR`}</b>
                    </Grid>
                    <Grid item xs={6}>
                      Total Staked in Pool
                    </Grid>
                    <Grid item xs={6} style={{ textAlign: 'right' }}>
                      {`${tmp.depositedAmount/1000} ARMR`}
                    </Grid>
                  </Grid>
                </div>
              </div>
            </Grid>)
        })}
      </Grid>
    </div >
  );
};

export default Sale;
