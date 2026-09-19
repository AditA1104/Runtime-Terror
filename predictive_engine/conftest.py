import os
import sys
from pathlib import Path

# app.py refuses to import without QNA_API_KEY set (no hardcoded fallback,
# since this repo is public). Give tests a key that only exists here.
os.environ.setdefault("QNA_API_KEY", "test-only-key-not-for-deployment")

# Add project root and predictive-engine directory to sys.path automatically
root_dir = Path(__file__).resolve().parent.parent
engine_dir = Path(__file__).resolve().parent

if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(engine_dir) not in sys.path:
    sys.path.insert(0, str(engine_dir))