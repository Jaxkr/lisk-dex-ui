import React from "react";
import './UserOrder.css';
import { userContext } from './context';
import * as transactions from '@liskhq/lisk-transactions';
import axios from 'axios';
import { DEXConfiguration } from "./util/Configuration";



export default class UserOrder extends React.Component<any, any> {
  static contextType = userContext;
  constructor(props, context) {
    super(props, context);
    this.state = {};
    const config = (this.context.configuration as DEXConfiguration);
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
  blockchainAPIURLs = {}
  dex_addresses = {}


  cancelOrder = () => {
    console.log(this.props.order);

    let dexAddress = this.dex_addresses[this.props.order.sourceChain];
    let passphrase = this.context.keys[this.props.order.sourceChain].passphrase;
    let targetChain = this.props.order.targetChain;
    let orderId = this.props.order.id;
    let broadcastURL = this.blockchainAPIURLs[this.props.order.sourceChain];


    const tx = transactions.transfer({
      amount: transactions.utils.convertLSKToBeddows('0.11').toString(),
      recipientId: dexAddress,
      data: `${targetChain},close,${orderId}`,
      passphrase: passphrase,
    });
    console.log(tx);
    axios.post(`${broadcastURL}/transactions`, tx).then((data) => {
      //console.log(data);
      alert(data.data.data.message);
    });
  }

  render() {
    // don't render if this is on the wrong side.
    if (this.props.order.side !== this.props.side) {
      return null;
    }
    let amountRemaining = this.props.order.side === 'ask' ? this.props.order.sizeRemaining : this.props.order.valueRemaining;
    let amount = this.props.order.side === 'ask' ? this.props.order.size : this.props.order.value;

    return (

      <div style={{ width: '100%', fontSize: '14px', backgroundColor: this.props.side === 'bid' ? '#286113' : '#700d0d', borderBottom: '1px solid black' }}>
        {(amountRemaining / Math.pow(10, 8)).toFixed(4)}/{(amount / Math.pow(10, 8)).toFixed(4)} <button className="cancel-order-button" onClick={this.cancelOrder}>Cancel</button>
        <br></br>
        Price: {this.props.order.price.toFixed(4)}
      </div>

    );
  }
}
