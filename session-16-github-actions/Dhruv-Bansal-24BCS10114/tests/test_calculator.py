import unittest

from app.calculator import add, divide, multiply


class CalculatorTests(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(2, 3), 5)

    def test_multiply(self):
        self.assertEqual(multiply(4, 3), 12)

    def test_divide_rejects_zero(self):
        with self.assertRaises(ValueError):
            divide(3, 0)


if __name__ == "__main__":
    unittest.main()
