class OrderBookStrikeElement:
    def __init__(self, price, qty, state='Y'):
        self.price = price
        self.qty = qty
        self.active = state

    def setActiveState(self, state):
        if state == 'Y' or state == 'N':
            self.active = state
        else:
            print("Wrong State, can only be N or Y")

    def getState(self):
        return self.active

    def getPrice(self):
        return self.price

    def getQty(self):
        return self.qty

    def setPrice(self, price):
        self.price = price

    def setQty(self, qty):
        self.qty = qty
