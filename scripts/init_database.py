#!/usr/bin/env python3
"""Initialize the job_portal database by running schema.sql"""

import sys
from pathlib import Path
import pymysql

# Get the database configuration
ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = ROOT / 'backend'
sys.path.insert(0, str(BACKEND_PATH))

from app.config import settings

def init_database():
    """Create database and load schema"""
    schema_file = ROOT / 'database' / 'schema.sql'
    
    # Connect to MySQL without specifying a database
    conn = pymysql.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD or '',
        autocommit=False,
        charset='utf8mb4'
    )
    
    try:
        cursor = conn.cursor()
        
        # Create database
        print(f"Creating database '{settings.DB_NAME}'...")
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{settings.DB_NAME}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        cursor.execute(f"USE `{settings.DB_NAME}`")
        
        # Read and execute schema
        print(f"Loading schema from {schema_file}...")
        with open(schema_file, 'r', encoding='utf-8') as f:
            schema_sql = f.read()
        
        # Split by semicolon and execute each statement
        for statement in schema_sql.split(';'):
            statement = statement.strip()
            if statement:
                cursor.execute(statement)
        
        conn.commit()
        print(f"✓ Database '{settings.DB_NAME}' initialized successfully")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Failed to initialize database: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    init_database()
