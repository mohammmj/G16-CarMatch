import psycopg2

def connect_to_db():
    try:
        conn = psycopg2.connect(
            host="pgserver.mau.se",
            database="message",
            user="ao7391",
            password="8hk5hh1b",
            port="5432"
        )
        return conn
    except psycopg2.Error as e:
        print("Kunde inte ansluta till databasen:", e)
        return None
    
conn = connect_to_db()
if conn is None:
    exit()

cursor = conn.cursor()

def skriva_text():
    try:
        namn=input("vad heter du ")
        text=input("vad vill du skriva ")
        cursor.execute("""
            insert into messages 
                (sender,message) values ( %s, %s );
            """, (namn, text))
        conn.commit()

    except Exception as e:
            print("Ett fel uppstod:", e)
            return None
    finally:
            cursor.close()
            conn.close()

skriva_text()
