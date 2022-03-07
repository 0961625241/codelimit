import React, { useState, useEffect } from 'react';
import './App.css';
import { Factory } from "./abi/abi_uniswapFactory";
import { Router } from "./abi/abi_uniswapRouter";
import { Pair } from "./abi/abi_uniswapPair";
import { Token } from "./abi/abi_token";
import { Limit } from "./abi/abi_limitOrder";
import Web3 from 'web3';
function App() {
  const [account, setAccount] = useState();
  const [ethBalance, setEthBalance] = useState();
  const [tokenBalance1, setTokenBalance1] = useState();
  const [tokenBalance2, setTokenBalance2] = useState();
  const [factoryContract, setFactoryContract] = useState();
  const [routerContract, setRouterContract] = useState();
  const [addressToken1, setAddressToken1] = useState('0xc778417E063141139Fce010982780140Aa0cD5Ab');
  const [addressToken2, setAddressToken2] = useState('0xc778417E063141139Fce010982780140Aa0cD5Ab');
  const [valueToken1, setValueToken1] = useState('')
  const [valueToken2, setValueToken2] = useState('')
  const [valuePrice, setValuePrice] = useState('')
  const [limitOrders, setLimitOrders] = useState()
  const [listPendingOrders, setListPendingOrders] = useState([]);
  const [getAmountOut,setGetAmountOunt] = useState();
  useEffect(async () => {
    window.web3 = new Web3(window.ethereum)
    await loadBlockchainData()
  }, [account, addressToken1, addressToken2])


  const loadBlockchainData = async () => {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    const ethBalance = await web3.eth.getBalance(accounts[0])
    const tokenContractx1 = await new web3.eth.Contract(Token.abi, addressToken1)
    const tokenContractx2 = await new web3.eth.Contract(Token.abi, addressToken2)
    if (account !== undefined) {
      const tokenBalancex1 = await tokenContractx1.methods.balanceOf(account).call();
      setTokenBalance1(window.web3.utils.fromWei(tokenBalancex1, 'Ether'))
      const tokenBalancex2 = await tokenContractx2.methods.balanceOf(account).call();
      setTokenBalance2(window.web3.utils.fromWei(tokenBalancex2, 'Ether'))
    }
    const factoryContractx = await new web3.eth.Contract(Factory.abi, Factory.addressFactory)
    const routerContractx = await new web3.eth.Contract(Router.abi, Router.addressRouter);
    const limitOrdersx = await new web3.eth.Contract(Limit.abi, Limit.address);
    setLimitOrders(limitOrdersx)
    setAccount(accounts[0])
    setEthBalance(window.web3.utils.fromWei(ethBalance, 'Ether'))
    setRouterContract(routerContractx)
    setFactoryContract(factoryContractx)
  }

  const onChangeAdressToken1 = (event) => {
    setAddressToken1(event.target.value)
  }
  const onChangeAdressToken2 = (event) => {
    setAddressToken2(event.target.value)
  }
  const onChangeValueToken1 = async (event) => {
    setValueToken1(event.target.value)
    const web3 = window.web3
    if (event.target.value == 0) {
    } else {
      await factoryContract.methods.getPair(addressToken1, addressToken2)
        .call().then(async (data) => {
          const Pairx = await new web3.eth.Contract(Pair.abi, data)
          let reserves = await Pairx.methods.getReserves().call();
          let reserveETH;
          let reserveDAI;
          if (addressToken1 < addressToken2) {
            reserveETH = reserves[0];
            reserveDAI = reserves[1];
          } else {
            reserveETH = reserves[1];
            reserveDAI = reserves[0];
          }
          let daiAmountMin = await routerContract.methods.getAmountOut((event.target.value * 10 ** 18).toString(), reserveETH, reserveDAI).call();
          console.log(daiAmountMin / (10 ** 18))
          setValueToken2(daiAmountMin / (10 ** 18))
          setValuePrice(daiAmountMin / (10 ** 18) / event.target.value)


          let getAmountOutx = await routerContract.methods.getAmountOut((event.target.value * 10 ** 18).toString(),reserveETH, reserveDAI).call();
          setGetAmountOunt(getAmountOutx)
          // let token2toToken1 = await routerContract.methods.getAmountOut((1 * 10 ** 18).toString(),reserveDAI,reserveETH).call();
        })
    }
  }
  const onChangeValueToken2 = (event) => {
    setValueToken2(event.target.value)
    setValuePrice(event.target.value / valueToken1)
  }
  const onChangeValuePrice = (event) => {
    setValuePrice(event.target.value)
    setValueToken2(event.target.value * valueToken1)
  }
  const placeOrder = async () => {
    console.log(valueToken1)
    console.log((valueToken1 * 10 ** 18).toString())
    console.log(getAmountOut)
    console.log(limitOrders)
    console.log((valueToken1 * (10 ** 18)).toString())

    // const placeOrderx = await limitOrders.methods.placeETHTokenOrder(addressToken2,getAmountOut,getAmountOut)
    // .send({ from: account,value: (valueToken1 * 10 ** 18).toString() });
    // const placeOrderx = await limitOrders.methods.placeBNBTokenOrder(addressToken2,getAmountOut,getAmountOut)
    // .send({ from: account,value: (valueToken1 * 10 ** 18).toString() });
    // const placeOrderx = await limitOrders.methods.placeTokenBNBOrder(addressToken1,(valueToken1 * 10 ** 18).toString(),getAmountOut,getAmountOut)
    // .send({ from: account});
     const placeOrderx = await limitOrders.methods.placeTokenTokenOrder(addressToken1,(valueToken1 * (10 ** 18)).toString(),addressToken2,getAmountOut,getAmountOut)
    .send({ from: account});
  }
  const getPendingOrders = async () => {
    let listPendingOrdersx = [];
    const limitOrdersx = await limitOrders.methods.getPendingOrders().call();
    for (let i = 0; i < limitOrdersx.length; i++) {
      let result = await limitOrders.methods.orders(limitOrdersx[i]).call()
      listPendingOrdersx.push(result)
    }
    setListPendingOrders(listPendingOrdersx)

  }
  const cancelOrder=async(id)=>{
    await limitOrders.methods.cancelOrder(id).send({ from: account });;
  }
  const excuter =async(id)=>{
    console.log(id)
   //  let qua = await limitOrders.methods.fulfilOrder(id).call()
     let qua = await limitOrders.methods.fulfilOrder(id).send({ from: account });;
      console.log(qua)
}
const approval = async (address) => {
  const web3 = window.web3
  const coin = new web3.eth.Contract(Token.abi, '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984') //address Token 
  console.log("methods", coin.methods)
  await coin.methods.approve(
      "0x05D1076138E62C80a8a5BA05A36f91e5eBeFf102",
      "1000000000000000000000000000000"
  ).send({
      from: account
  }).then(rep => console.log("SUCCESS!", rep))
}
  
  return (
    <>
      <div className='addressAccount'>adrress:{account}</div>
      <div className='section1'>
        <div>
          <div className="limitTitle">Limit Order</div>
          <div className='limitContent'>
            <div>
              <select className='titleToken' value={addressToken1} onChange={onChangeAdressToken1}>
                <option value="0xc778417E063141139Fce010982780140Aa0cD5Ab">ETH</option>
                <option value="0xad6d458402f60fd3bd25163575031acdce07538d">DAI</option>
                <option value="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984">UNISWAP</option>
              </select>

              <input type="number" value={valueToken1} onChange={onChangeValueToken1}></input>
            </div>
            <div>
              <label>Balance:{addressToken1 === '0xc778417E063141139Fce010982780140Aa0cD5Ab' ? ethBalance : tokenBalance1}</label>
            </div>
            <div>
              <label id='titleToken'>Price:</label>
              <input type="number" value={valuePrice} onChange={onChangeValuePrice}></input>
            </div>
            <div>
              <select className='titleToken' value={addressToken2} onChange={onChangeAdressToken2}>
                <option value="0xc778417E063141139Fce010982780140Aa0cD5Ab">ETH</option>
                <option value="0xad6d458402f60fd3bd25163575031acdce07538d">DAI</option>
                <option value="0x1f9840a85d5af5bf1d1762f925bdaddc4201f984">UNISWAP</option>
              </select>
              <input type="number" value={valueToken2} onChange={onChangeValueToken2}></input>
            </div>
            <div>
              <label>Balance:{addressToken2 === '0xc778417E063141139Fce010982780140Aa0cD5Ab' ? ethBalance : tokenBalance2}</label>
            </div>
            <div>
              1 ETH = 1 DAI
            </div>
            <div className='btnPlaceLimit'>
              <button onClick={approval}>approval</button>
              <button onClick={placeOrder}>Place Order</button>
              <button onClick={getPendingOrders}>get Pending Orders</button>
              <br></br>
            </div>
          </div>
        </div>
      </div>
      <div>
        <table>
          <tbody>
            {listPendingOrders.map((item, index) => {
              return (
                <>
                  <tr>
                  <button onClick={()=>excuter(item.id)}>excute</button>
                    <th>ID</th>
                    {/* <td>{item.id}</td> */}
                  </tr>
                  <tr>
                    <th>owner</th>
                    <td>{item.owner}</td>
                  </tr>
                  <tr>
                    <th>pair</th>
                    <td>{item.pair}</td>
                  </tr>
                  <tr>
                    <th>tokenIn</th>
                    <td>{item.tokenIn}</td>
                  </tr>
                  <tr>
                    <th>tokenOut</th>
                    <td>{item.tokenOut}</td>
                  </tr>
                  <tr>
                    <th>amountIn</th>
                    <td>{item.amountIn}</td>
                  </tr>
                  <tr>
                    <th>minAmountOut</th>
                    <td>{item.minAmountOut}</td>
                  </tr>
                  <tr>
                    <th>targetAmountOut</th>
                    {/* <td>{item.targetAmountOut}</td> */}
                  </tr>
                  <tr>
                    <th>time</th>
                    {/* <td>{(new Date(item.timestamp)).getFullYear()}</td> */}
                  </tr>
                  <tr>
                    <th>Cancel Order {item.id}</th>
                    <th><button onClick={()=>cancelOrder(item.id)}>Cancel</button></th>
                  </tr>
                </>
              )

            })}
          </tbody></table>

      </div>
    </>
  );
}
export default App;
