import json
import sys
import pandas as pd
from pandas_datareader import data, wb
import numpy as np
import datetime as dt 
from datetime import datetime
import matplotlib.pyplot as plt

start = pd.to_datetime('2011-01-01')
end = pd.to_datetime('today')

name = 'RCMT'
stock = data.DataReader(name,'yahoo',start,end)

SMA30 = pd.DataFrame()
SMA30['Adj Close Price'] = stock['Adj Close'].rolling(window=30).mean()

SMA100 = pd.DataFrame()
SMA100['Adj Close Price'] = stock['Adj Close'].rolling(window=100).mean()

data = pd.DataFrame()
data[name] = stock['Adj Close']
data['SMA30'] = SMA30['Adj Close Price']
data['SMA100'] = SMA100['Adj Close Price']

def buy_sell(data):
    sigPriceBuy = []
    sigPriceSell = []
    flag = -1
    
    for i in range(len(data)):
        if data['SMA30'][i] > data['SMA100'][i]:
            if flag != 1:
                sigPriceBuy.append(data[name][i])
                sigPriceSell.append(np.nan)
                flag = 1
            else:
                sigPriceBuy.append(np.nan)
                sigPriceSell.append(np.nan)
        elif data['SMA30'][i] < data['SMA100'][i]:
            if flag != 0:
                sigPriceBuy.append(np.nan)
                sigPriceSell.append(data[name][i])
                flag = 0
            else:
                sigPriceBuy.append(np.nan)
                sigPriceSell.append(np.nan)
        else:
            sigPriceBuy.append(np.nan)
            sigPriceSell.append(np.nan)
    return (sigPriceBuy, sigPriceSell)

buy_sell = buy_sell(data)
data['Buy_Signal_Price'] = buy_sell[0]
data['Sell_Signal_Price'] = buy_sell[1]

result = data.to_json(orient="split")
parsed = json.loads(result)

resp = {
    "Response": 200,
    "Message":"JSON with flags",
    "Data":parsed
}

print(json.dumps(parsed))
sys.stdout.flush()

