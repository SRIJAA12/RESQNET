#!/usr/bin/env python3
import sys
import os

# Add backend directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.db.seed import seed_database

if __name__ == "__main__":
    print(">>> Executing synthetic flood response demonstration seeder...")
    seed_database()
