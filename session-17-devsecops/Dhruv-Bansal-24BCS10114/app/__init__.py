from flask import Flask, jsonify, request


def create_app():
    app = Flask(__name__)

    @app.get("/")
    def home():
        return "Dhruv's DevSecOps lab"

    @app.get("/health")
    def health():
        return jsonify(status="ok")

    @app.post("/sum")
    def total():
        data = request.get_json(silent=True) or {}
        numbers = data.get("numbers")
        if not isinstance(numbers, list) or any(type(n) not in (int, float) for n in numbers):
            return jsonify(error="numbers must be a list of numbers"), 400
        return jsonify(total=sum(numbers))

    return app
