import os
from flask import Flask, render_template
import requests

app = Flask(__name__)

@app.route('/')
def index():
    try:
        # Voláme lokální backend pro stav
        data = requests.get("http://localhost:5001/state", timeout=2).json()
    except:
        data = {
            "name": "Skener (Chyba spojení)",
            "scan_state": "odpojeno",
            "scan_dir": "-",
            "scan_process": {"pos": 0, "end": -1}
        }
    return render_template('index.html', data=data)

@app.route('/skeny')
def skeny():
    try:
        state = requests.get("http://localhost:5001/state", timeout=2).json()
        path = state.get("scan_dir", ".")
        # Načtení souborů z adresáře skeneru
        files = os.listdir(path) if os.path.exists(path) else ["nenalezeno"]
    except:
        files = ["chyba při načítání"]

    return render_template('skeny.html', files=files)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)