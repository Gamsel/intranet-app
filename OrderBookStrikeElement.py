class OrderBookStrikeElement:
    def __init__(self, price,qty):
        self.price = price
        self.qty = qty

    def getPrice(self):
        return self.price

    def getQty(self):
        return self.qty

    def setPrice(self, price):
        self.price = price

    def setQty(self, qty):
        self.qty = qty
