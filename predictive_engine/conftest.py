import sys
from pathlib import Path

# Add project root and predictive-engine directory to sys.path automatically
root_dir = Path(__file__).resolve().parent.parent
engine_dir = Path(__file__).resolve().parent

if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))
if str(engine_dir) not in sys.path:
    sys.path.insert(0, str(engine_dir))
