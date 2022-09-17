from OrderBookSide import OrderBookSide


class OrderBookItem:
    def __init__(self, MM, active=False):
        self.MM = MM
        self.active = active
        self.CallSide = OrderBookSide()
        self.PutSide = OrderBookSide()

    def setActive(self, mode):
        self.active = mode

    def getActiveStatus(self):
        return self.active

    def resetOrderBook(self):
        self.CallSide = OrderBookSide()
        self.PutSide = OrderBookSide()


    def updateContract(self, strikeID, optionType, side, price, quantity, operator, origin, mode="Live"):

        if not (optionType == "C" or optionType == "P") or not (side == "B" or side == "S") or quantity == 0 or price == 0:
            return "503"

        if optionType == 'C':
            return self.CallSide.updateOption(strikeID, side, price, quantity, operator, origin, mode)
        elif optionType == 'P':
            return self.PutSide.updateOption(strikeID, side, price, quantity, operator, origin, mode)

    def activeAll(self):
        self.CallSide.activateAll()
        self.PutSide.activateAll()

    def toJson(self):
        x = '''{
            "MM":{
                "name": "''' + self.MM + '''"
            },
            "Calls":{
               ''' + self.CallSide.getJson() + '''
            },
            "Puts":{
                ''' + self.PutSide.getJson() + '''
            },
            "active": "''' + str(self.active) + '''"
        }  '''

        return x

