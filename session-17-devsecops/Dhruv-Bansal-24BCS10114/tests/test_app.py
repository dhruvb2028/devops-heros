import unittest

from app import create_app


class AppTests(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()

    def test_home(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertIn(b"Dhruv's DevSecOps lab", response.data)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.json, {"status": "ok"})

    def test_sum(self):
        response = self.client.post("/sum", json={"numbers": [4, 7, -2]})
        self.assertEqual(response.json, {"total": 9})

    def test_invalid_input(self):
        response = self.client.post("/sum", json={"numbers": [1, "two"]})
        self.assertEqual(response.status_code, 400)


if __name__ == "__main__":
    unittest.main()
