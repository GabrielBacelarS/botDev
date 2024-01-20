const crypto = require('crypto');
const axios = require('axios');
const { DATE } = require('sequelize');
const SYMBOL = 'BTCUSDT';
const BUY_PRICE  = 4000;
const SELL_PRICE = 4100;
const QUANTITY = '0.001';
const API_KEY = 'Z4h3qYEZl2sz00KMon8d5xyghh6GrHnPBQQltWgDDloKP3qLK5Gkwo0Qbn1RQeS4';
const SECRET_KEY = 'hQzRakiJUxjg9d2XIb3k3KO6QdSvsEdUk2e8mD9Q6lBw6rAganUupWO4G8P8McXu';
const API_URL = 'https://testnet.binance.vision'; //https://api.binance.com

let isOpened = false;
function calcSMA(data) {
    const closes = data.map((candle) => parseFloat(candle[4]));
    const sum = closes.reduce((a, b) => a + b);
    return sum / data.length;
}

async function start() {
    const { data } = await axios.get(
        API_URL + '/api/v3/klines?limit=21&interval=15m&symbol=' + SYMBOL,
    );
    const candle = data[data.length - 1];
    const price = parseFloat(candle[4]);
    console.log('--------------');
    console.log('price:' + price);
    const sma = calcSMA(data);
    console.log('sma:' + sma);
    console.log('IsOpened: ' + isOpened);
        //(sma * 0.9)
    if (price <= (sma * 0.9) && isOpened === false) {
        isOpened = true;
        newOrder(SYMBOL,QUANTITY, "buy")
        //sma * 1.1 
    } else if (price >= sma * 1.1  && isOpened === true) {
        newOrder(SYMBOL,QUANTITY, "sell")
        isOpened = false;
    } else {
        console.log('Aguarde');
    }
}

async function newOrder(symbol, quantity, side) {
    const order = { symbol, quantity, side };
    order.type = 'MARKET';
    order.timestamp = Date.now();

    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(new URLSearchParams(order).toString())
        .digest('hex');

    order.signature = signature;
    try {
        const { data } = await axios.post(
            API_URL + '/api/v3/order',
            new URLSearchParams(order).toString(),
            { headers: { 'X-MBX-APIKEY': API_KEY } }
        );
        console.log(data);
    } catch (err) {
        console.log(err);
    }
}
setInterval(start, 1000);
