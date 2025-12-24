# Nexus Sentinel 🛡️

**Nexus Sentinel** is a Data Governance Gateway designed to protect AI models from bad data. It acts as a bridge between live **market feeds** and [**DataHub**](https://datahub.com/), programmatically emitting trust signals and governance tags to ensure high quality data consumption.

## 🚀 How it Works
1. **Inspects:** Fetches real-time market data (TSLA, AAPL, BTC) via Python.
2. **Governs:** If volatility is high (> 2.5%), it flags the data.
3. **Emits:** Automatically sends metadata tags (`Verified` or `HighVolatilityRisk`) to **DataHub** using the REST Emitter.

## 🛠️ Tech Stack
* **Backend:** FastAPI (Python)
* **Frontend:** React + Vite (Tailwind CSS)
* **Metadata Platform:** DataHub (Acryl Data)

## 🏃‍♂️ How to Run
### 1. Backend
```bash
# In the root folder
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
### 2. Frontend

```bash
cd nexus-frontend
npm install
npm run dev
```

## 📺 Live Demo
- **Dashboard UI:** [https://nexus-sentinel-ui.onrender.com/](https://nexus-sentinel-ui.onrender.com/)

> ⚠️ **Important Deployment Note:** The cloud demo is hosted on Render to showcase the UI and API architecture. However, as we ran **DataHub** typically runs on a private local network, the "Metadata Sync" and "Health Check" features require a local DataHub instance running on port `8080`.


## 🔍 Troubleshooting Ports
Nexus Sentinel expects the following services to be active:
* **Frontend:** `http://localhost:5173` (Vite)
* **Backend API:** `http://localhost:8000` (FastAPI)
* **DataHub GMS:** `http://localhost:8080` (Metadata Service)
* **DataHub UI:** `http://localhost:9002` (Dashboard)

