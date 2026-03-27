"""Launch script that ensures user site-packages are available."""
import sys
import os

# Ensure user site-packages are in path
user_site = os.path.join(os.environ.get("APPDATA", ""), "Python", "Python314", "site-packages")
if user_site not in sys.path:
    sys.path.insert(0, user_site)

# Also add a hardcoded fallback
fallback = r"C:\Users\Temp\AppData\Roaming\Python\Python314\site-packages"
if fallback not in sys.path:
    sys.path.insert(0, fallback)

import uvicorn

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
