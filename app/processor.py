import yfinance as yf
from datetime import datetime

def fetch_market_data(ticker: str):
    # Fetch real market data
    stock = yf.Ticker(ticker)
    hist = stock.history(period="1d", interval="1m")
    
    if hist.empty:
        return None

    # Calculate price volatility
    opening_price = hist['Open'].iloc[0]
    closing_price = hist['Close'].iloc[-1]
    volatility = abs((closing_price - opening_price) / opening_price) * 100

    return {
        "urn": f"urn:li:dataset:(urn:li:dataPlatform:yfinance,{ticker.lower()}_market_data,PROD)",
        "ticker": ticker,
        "price": float(round(closing_price, 2)),
        "volatility": float(round(volatility, 2)),
        "is_trustworthy": bool(volatility < 2.5)
    }