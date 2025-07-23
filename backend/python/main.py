import psycopg2
from flask import Flask, request, render_template

app = Flask(__name__)

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
    
@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        namn = request.form["namn"]
        text = request.form["text"]
        
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
        cursor.execute("""
            insert into messages 
                (sender,message) values ( %s, %s );
            """, (namn, text))
        conn.commit()
        cursor.close()
        conn.close()
        return "Meddelande sparat!"

    except Exception as e:
            print("Ett fel uppstod:", e)
            return None
    finally:
            cursor.close()
            conn.close()

if __name__ == "__main__":
    app.run(debug=True)
