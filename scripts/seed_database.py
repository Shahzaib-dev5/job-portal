#!/usr/bin/env python3
"""Load seed data into the job_portal database"""

import sys
from pathlib import Path

# Get the database configuration
ROOT = Path(__file__).resolve().parents[1]
BACKEND_PATH = ROOT / 'backend'
sys.path.insert(0, str(BACKEND_PATH))

from app.config import settings
import pymysql

def seed_database():
    """Load seed data from seed.sql"""
    seed_file = ROOT / 'database' / 'seed.sql'
    
    # Connect to the database
    conn = pymysql.connect(
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD or '',
        database=settings.DB_NAME,
        autocommit=False,
        charset='utf8mb4'
    )
    
    try:
        cursor = conn.cursor()
        
        # Read seed file
        print(f"Loading seed data from {seed_file}...")
        with open(seed_file, 'r', encoding='utf-8') as f:
            seed_sql = f.read()
        
        # Remove SQL comments before processing
        lines = seed_sql.split('\n')
        cleaned_lines = []
        for line in lines:
            # Remove single-line comments
            if '--' in line:
                line = line[:line.index('--')]
            cleaned_lines.append(line)
        
        seed_sql = '\n'.join(cleaned_lines)
        
        # Split by semicolon and execute each statement
        statements = seed_sql.split(';')
        count = 0
        
        for statement in statements:
            statement = statement.strip()
            # Skip empty statements
            if not statement:
                continue
            
            try:
                cursor.execute(statement)
                count += 1
            except pymysql.err.IntegrityError as e:
                # Skip duplicate key errors
                if "Duplicate entry" in str(e):
                    print(f"  ⚠ Skipping duplicate entry...")
                else:
                    raise
            except Exception as e:
                print(f"  ✗ Error executing: {statement[:80]}...")
                print(f"    Error: {e}")
                raise
        
        conn.commit()
        print(f"✓ Seed data loaded successfully ({count} statements executed)")
        
        # Verify the data
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM companies")
        company_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM jobs")
        job_count = cursor.fetchone()[0]
        
        print(f"\n📊 Database Summary:")
        print(f"   • Users: {user_count}")
        print(f"   • Companies: {company_count}")
        print(f"   • Jobs: {job_count}")
        
    except Exception as e:
        conn.rollback()
        print(f"✗ Failed to load seed data: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

if __name__ == '__main__':
    seed_database()
