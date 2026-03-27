#!/bin/bash
cd "$(dirname "$0")/backend"
"C:/Users/Temp/AppData/Roaming/Python/Python314/Scripts/uvicorn.exe" app.main:app --reload --port 8000
