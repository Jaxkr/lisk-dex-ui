import React from 'react';
import OrderbookEntry from './OrderbookEntry';
import './Orderbook.css';
import { groupByKey, Values } from './Utils'

export default class Orderbook extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    
    if (this.props.side === 'asks') {
      const groupedAskOrders = Values(groupByKey(this.props.orderBookData.asks, 'price', 'sizeRemaining'));
      const orders = groupedAskOrders.map(order => (
        <OrderbookEntry
          whole={Math.pow(10, 8)} // 10 ** 8 beddow in one LSK
          key={order.id}
          size={order.sizeRemaining}
          price={order.price}
          maxSize={this.props.orderBookData.maxSize}
          side={this.props.side}
          sizeDecimals={4}
          priceDecimals={this.props.priceDecimalPrecision}
        ></OrderbookEntry>
      ));
      return <div className="askOrderList">{orders}</div>;
    }
    if (this.props.side === 'bids') {
      const groupedBidsOrders = Values(groupByKey(this.props.orderBookData.bids, 'price', 'valueRemaining'));
      const orders = groupedBidsOrders.map(order => (
        <OrderbookEntry
          whole={Math.pow(10, 8)} // 10 ** 8 beddow in one LSK
          key={order.id}
          size={order.valueRemaining}
          price={order.price}
          maxSize={this.props.orderBookData.maxSize}
          side={this.props.side}
          sizeDecimals={4}
          priceDecimals={this.props.priceDecimalPrecision}
        ></OrderbookEntry>
      ));
      return <div className="bidOrderList">{orders}</div>;
    }
  }
}