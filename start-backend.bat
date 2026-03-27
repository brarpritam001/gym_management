@echo off
cd /d "%~dp0backend"
C:\Users\Temp\AppData\Roaming\Python\Python314\Scripts\uvicorn.exe app.main:app --reload --port 8000

@REM python -m uvicorn app.main:app --reload --port 8000