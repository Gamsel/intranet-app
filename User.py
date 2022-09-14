from Portfolio import Portfolio
from OrderBookItem import OrderBookItem

class User:
    def __init__(self, username,  orderbook = None ):
        self.username = username
        self.portfolio = Portfolio()
        if orderbook is not None:
            self.Orderbook = OrderBookItem(username)
        else:
            self.Orderbook = None


    def returnPortfolioPositionsJson(self):
        return self.portfolio.getPositionJson()

    def addPortfolioPosition(self, strikeID, optionType, side, price, quantity, cp):
        self.portfolio.addPosition(strikeID, optionType, side, price, quantity, cp)

    def getUserName(self):
        return self.username

    def innit(self):
        self.portfolio.loadPositions(self.username)

    def getOrderBook(self):
        return self.Orderbook