import React from "react";
import "./PlaceOrder.css";
import BalanceDisplay from './BalanceDisplay';
import { userContext } from './context';
import * as transactions from '@liskhq/lisk-transactions';
import axios from 'axios';
import { DEXConfiguration } from "./util/Configuration";

 

export default class PlaceOrder extends React.Component<any, any> {
  static contextType = userContext;
  constructor(props, context) {
    super(props, context);
    this.state = {
      price: 0,
      amount: 0,
      marketMode: true,
    };


    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    const config = (context.configuration as DEXConfiguration);
    this.dex_addresses = {
      [context.currentMarket[0]]: config.markets[context.activeMarket].DEX_ADDRESSES[context.currentMarket[0].toUpperCase()],
      [context.currentMarket[1]]: config.markets[context.activeMarket].DEX_ADDRESSES[context.currentMarket[1].toUpperCase()],
    }
    Object.keys(this.dex_addresses).forEach(e => {
      if (this.dex_addresses[e] === undefined) {
        throw new Error("Invalid active market or bad configuration.")
      }
    })
    this.blockchainAPIURLs = {
      [context.currentMarket[0]]: config.markets[context.activeMarket].LISK_API_URLS[context.currentMarket[0]],
      [context.currentMarket[1]]: config.markets[context.activeMarket].LISK_API_URLS[context.currentMarket[1]],
    }
  }
  dex_addresses = {}
  blockchainAPIURLs = {}
  


  handleChange(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.placeOrder();
  }

  switchMode = () => {
    this.setState({ marketMode: !this.state.marketMode });
  }

  placeOrder = () => {
    if (this.state.marketMode) {
      let dexAddress = undefined;
      let destAddress = undefined;
      let passphrase = undefined;
      let destChain = undefined;
      let broadcastURL = undefined;
      if (this.props.side === 'buy') {
        dexAddress = this.dex_addresses[this.context.currentMarket[1]]
        destAddress = this.context.keys[this.context.currentMarket[0]].address;
        passphrase = this.context.keys[this.context.currentMarket[1]].passphrase;
        destChain = this.context.currentMarket[0];
        broadcastURL = this.blockchainAPIURLs[this.context.currentMarket[1]];
      } else if (this.props.side === 'sell') {
        dexAddress = this.dex_addresses[this.context.currentMarket[0]]
        destAddress = this.context.keys[this.context.currentMarket[1]].address;
        passphrase = this.context.keys[this.context.currentMarket[0]].passphrase;
        destChain = this.context.currentMarket[1];
        broadcastURL = this.blockchainAPIURLs[this.context.currentMarket[0]];

      }

      if (dexAddress && destAddress && passphrase && destChain && broadcastURL) {
        broadcastURL = broadcastURL[0];
        console.log(broadcastURL);
        if (this.state.amount > 0) {
          const tx = transactions.transfer({
            amount: transactions.utils.convertLSKToBeddows(this.state.amount.toString()).toString(),
            recipientId: dexAddress,
            data: `${destChain},market,${destAddress}`,
            passphrase: passphrase,
          });
          console.log(tx);
          axios.post(`${broadcastURL}/transactions`, tx).then((data) => {
            //console.log(data);
            alert(data.data.data.message);
          });
        }
      }

    } else {
      let dexAddress = undefined;
      let destAddress = undefined;
      let passphrase = undefined;
      let destChain = undefined;
      let broadcastURL = undefined;
      if (this.props.side === 'buy') {
        dexAddress = this.dex_addresses[this.context.currentMarket[1]]
        destAddress = this.context.keys[this.context.currentMarket[0]].address;
        passphrase = this.context.keys[this.context.currentMarket[1]].passphrase;
        destChain = this.context.currentMarket[0];
        broadcastURL = this.blockchainAPIURLs[this.context.currentMarket[1]];
      } else if (this.props.side === 'sell') {
        dexAddress = this.dex_addresses[this.context.currentMarket[0]]
        destAddress = this.context.keys[this.context.currentMarket[1]].address;
        passphrase = this.context.keys[this.context.currentMarket[0]].passphrase;
        destChain = this.context.currentMarket[1];
        broadcastURL = this.blockchainAPIURLs[this.context.currentMarket[0]];

      }

      if (dexAddress && destAddress && passphrase && destChain && broadcastURL) {
        broadcastURL = broadcastURL[0];
        console.log(broadcastURL);
        if (this.state.amount > 0) {
          const tx = transactions.transfer({
            amount: transactions.utils.convertLSKToBeddows(this.state.amount.toString()).toString(),
            recipientId: dexAddress,
            data: `${destChain},limit,${this.state.price},${destAddress}`,
            passphrase: passphrase,
          });
          console.log(tx);
          axios.post(`${broadcastURL}/transactions`, tx).then((data) => {
            //console.log(data);
            alert(data.data.data.message);
          });
        }
      }
    }
  }

  render() {
    // console.log(this.dex_addresses);
    let canTrade = false;
    if (this.context.currentMarket[0] in this.context.keys && this.context.currentMarket[1] in this.context.keys) {
      canTrade = true;
    }
    return (
      <div style={{ padding: "5px" }}>
        <div className="action-name">{this.props.side.toUpperCase()}</div>
        <button className="market-limit-buttons" disabled={this.state.marketMode} onClick={this.switchMode}>Market</button>
        <button className="market-limit-buttons" disabled={!this.state.marketMode} onClick={this.switchMode}>Limit</button>
        {(this.props.side === 'buy') &&
          <BalanceDisplay whole={Math.pow(10, 8)} asset={this.context.currentMarket[1]}></BalanceDisplay>
        }
        {(this.props.side === 'sell') &&
          <BalanceDisplay whole={Math.pow(10, 8)} asset={this.context.currentMarket[0]}></BalanceDisplay>
        }
        {canTrade &&
          <form onSubmit={this.handleSubmit}>
            {!this.state.marketMode &&
              <>
                Price: <br></br>
                <input name="price" className="order-val-input" type="number" value={this.state.price} onChange={this.handleChange} />
              </>
            }
            Amount: <br></br>
            <input name="amount" className="order-val-input" type="number" value={this.state.amount} onChange={this.handleChange} />
            {this.state.marketMode &&
              <>
                {
                  this.props.side === 'buy' &&
                  <div style={{ color: 'grey', fontSize: '15px', marginBottom: '10px' }}>≈ {(this.state.amount / this.context.minAsk).toFixed(4)} {this.context.currentMarket[0].toUpperCase()}</div>
                }
                {
                  this.props.side === 'sell' &&
                  <div style={{ color: 'grey', fontSize: '15px', marginBottom: '10px' }}>≈ {(this.state.amount * this.context.maxBid).toFixed(4)} {this.context.currentMarket[1].toUpperCase()}</div>
                }
              </>
            }
            {!this.state.marketMode &&
              <>
                {
                  this.props.side === 'buy' &&
                  <div style={{ color: 'grey', fontSize: '15px', marginBottom: '10px' }}>≈ {(this.state.amount / this.state.price).toFixed(4)} {this.context.currentMarket[0].toUpperCase()}</div>
                }
                {
                  this.props.side === 'sell' &&
                  <div style={{ color: 'grey', fontSize: '15px', marginBottom: '10px' }}>≈ {(this.state.amount * this.state.price).toFixed(4)} {this.context.currentMarket[1].toUpperCase()}</div>
                }
              </>
            }
            <input className="place-order-button" type="submit" value="Submit" />
          </form>
        }
        {
          !canTrade &&
          <p style={{ color: 'grey' }}>
            Please sign in with your {this.context.currentMarket[0].toUpperCase()} <b>and</b> {this.context.currentMarket[1].toUpperCase()} passphrase to trade.
          </p>
        }
      </div >
    );
  }
}
