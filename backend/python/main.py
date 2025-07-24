import psycopg2
from flask import Flask, request, render_template, redirect, url_for

app = Flask(__name__)

def connect_to_db():
    return psycopg2.connect(
        host="pgserver.mau.se",
        database="message",
        user="ao7391",
        password="8hk5hh1b",
        port="5432"
    )

@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        namn = request.form["namn"]
        text = request.form["text"]
        
        try:
            conn = connect_to_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO messages (sender, message)
                VALUES (%s, %s);
            """, (namn, text))
            conn.commit()
            cursor.close()
            conn.close()
            return redirect(url_for('alla_meddelanden'))

        except Exception as e:
            return f"Ett fel uppstod: {e}"
    return render_template("index.html")

@app.route("/alla_meddelanden")
def alla_meddelanden():
    meddelanden = []
    try:
        conn = connect_to_db()
        cursor = conn.cursor()
        cursor.execute("SELECT sender, message FROM messages ORDER BY m_id DESC")
        meddelanden = cursor.fetchall()
        cursor.close()
        conn.close()
    except Exception as e:
        return f"Ett fel uppstod: {e}"

    return render_template("alla_medelande.html", meddelanden=meddelanden)

if __name__ == "__main__":
    app.run(debug=True, port=5001)

