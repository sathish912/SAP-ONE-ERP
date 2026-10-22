import os
import sys

# Ensure backend and app directories are in sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
APP_DIR = os.path.join(CURRENT_DIR, "app")
PARENT_DIR = os.path.dirname(CURRENT_DIR)

for p in (CURRENT_DIR, APP_DIR, PARENT_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

# Import the complete STACKLY SAP OneERP application containing all APIs
from app.main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 65)
    print("🚀 Starting STACKLY SAP OneERP (All Modules & APIs)")
    print("📖 Swagger API Docs: http://127.0.0.1:8000/docs")
    print("🌐 Full Web App:     http://127.0.0.1:8000/")
    print("=" * 65 + "\n")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
