from flask import Flask, render_template, json

app = Flask(__name__)
gallery_json = open("gallery_json.js").read()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/gallery_json')
def gallery_json():
    return json.dumps(gallery_json)

if __name__ == "__main__":
    app.run()