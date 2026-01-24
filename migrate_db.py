import sqlite3

def upgrade():
    conn = sqlite3.connect('backend/valutx.db')
    cursor = conn.cursor()
    
    # Check if version column exists in vault_items
    cursor.execute("PRAGMA table_info(vault_items)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'version' not in columns:
        print("Adding 'version' column to 'vault_items'...")
        cursor.execute("ALTER TABLE vault_items ADD COLUMN version INTEGER DEFAULT 1 NOT NULL")
        conn.commit()
    else:
        print("'version' column already exists in 'vault_items'.")

    # Check if audit_logs table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='audit_logs'")
    if not cursor.fetchone():
        print("Creating 'audit_logs' table...")
        cursor.execute("""
            CREATE TABLE audit_logs (
                id VARCHAR PRIMARY KEY,
                user_id VARCHAR NOT NULL,
                event_type VARCHAR NOT NULL,
                severity VARCHAR DEFAULT 'INFO',
                details TEXT,
                ip_address VARCHAR,
                user_agent VARCHAR,
                timestamp DATETIME,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        """)
        conn.commit()
    else:
        print("'audit_logs' table already exists.")

    conn.close()

if __name__ == "__main__":
    upgrade()
