from OrderBookStrikeElement import OrderBookStrikeElement



class OrderBookStrikeItem:
    def __init__(self, strikeID):
        self.positions = []
        self.strikeID = strikeID

    def activateAll(self):
        for i in self.positions:
            i.setActiveState('Y')

    def getPositionsCount(self):
        return len(self.positions)

    def getItemAtIndex(self, index):
        return self.positions[index]

    def deletItemAtIndex(self, index):
        self.positions.pop(index)

    def createNewPosition(self, price, qty, mode):

        if mode == "Freeze":
            self.positions.append(OrderBookStrikeElement(price, qty, 'N'))
        else:
            self.positions.append(OrderBookStrikeElement(price, qty))

        self.positions.sort(key=lambda x: x.price)

    def getPositions(self):
        return self.positions

    def getJson(self):

        if len(self.positions) == 0:

            y = ''' [{
         
                    "price": 0,
                    "qty": 0,
                    "active": "Y"
              
            }]'''

        else:
            if len(self.positions) == 1:
                y = ''' [{

                                      "price": ''' + str(self.positions[0].getPrice()) + ''',
                                      "qty": ''' + str(self.positions[0].getQty()) + ''',
                                      "active": "''' + self.positions[0].getState() + '''"

                                }] '''
            else:
                y = '['
                for i in range(len(self.positions)):
                    y = y + ''' {
                    
                          "price": ''' + str(self.positions[i].getPrice()) + ''',
                          "qty": ''' + str(self.positions[i].getQty()) + ''',
                          "active": "''' + self.positions[i].getState() + '''"
                      
                    },'''
                y = y[:-1]

                y = y + ']'

        return y