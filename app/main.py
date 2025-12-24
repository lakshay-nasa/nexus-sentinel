from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .processor import fetch_market_data
from .governance import DataHubSentinel
import os
import httpx

app = FastAPI(title="Nexus Sentinel: DataHub Gateway")

# --- CORS CONFIGURATION ---
# This allows Vite frontend to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the DataHub Sentinel with the GMS (Metadata Service) URL
sentinel = DataHubSentinel(gms_url=os.getenv("DATAHUB_GMS_URL", "http://localhost:8080"))

# --- HEALTH PROXY ENDPOINT ---
# This endpoint allows the frontend to check DataHub status via the backend
@app.get("/health/datahub")
async def check_datahub_health():
    """Checks if the DataHub GMS service is reachable."""
    try:
        async with httpx.AsyncClient() as client:
            # We ping the GMS health endpoint on port 8080
            response = await client.get("http://localhost:8080/health", timeout=2.0)
            return {"online": response.status_code == 200}
    except Exception:
        # If the backend cannot reach port 8080, DataHub is likely down
        return {"online": False}

# --- SYNC ENDPOINT ---
@app.get("/sync/{ticker}")
async def sync_data_to_datahub(ticker: str):
    """Fetches market data and emits governance metadata to DataHub."""
    data = fetch_market_data(ticker)
    if not data:
        raise HTTPException(status_code=404, detail="Ticker not found")

    try:
        # Logic to assign 'Verified' or 'HighVolatilityRisk' tags
        tag_assigned = sentinel.emit_trust_metadata(data)
        return {
            "message": f"Successfully synced {ticker} metadata to DataHub",
            "market_data": data,
            "governance_tag": tag_assigned
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))