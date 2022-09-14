from Portfolio import Portfolio

class User:
    def __init__(self, username):
        self.username = username
        self.portfolio = Portfolio()


    def returnPortfolioPositionsJson(self):
        return self.portfolio.getPositionJson()

    def addPortfolioPosition(self, strikeID, optionType, side, price, quantity, cp):
        self.portfolio.addPosition(strikeID, optionType, side, price, quantity, cp)

    def getUserName(self):
        return self.username

    def innit(self):
        self.portfolio.loadPositions(self.username)
