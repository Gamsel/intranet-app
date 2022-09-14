from OrderBookStrikeItem import OrderBookStrikeItem

class OrderBookSide:
    def __init__(self):
        self.BuySide = []
        self.SellSide = []

        for i in range(0,9):
            self.BuySide.append(OrderBookStrikeItem(i))
            self.SellSide.append(OrderBookStrikeItem(i))

    def getJson(self):
        x = ''' 
            "BuySide":[
                {"strikeID": "0", "item": ''' + self.BuySide[0].getJson() + '''},
                {"strikeID": "1", "item": ''' + self.BuySide[1].getJson() + '''},
                {"strikeID": "2", "item": ''' + self.BuySide[2].getJson() + '''},
                {"strikeID": "3", "item": ''' + self.BuySide[3].getJson() + '''},
                {"strikeID": "4", "item": ''' + self.BuySide[4].getJson() + '''},
                {"strikeID": "5", "item": ''' + self.BuySide[5].getJson() + '''},
                {"strikeID": "6", "item": ''' + self.BuySide[6].getJson() + '''},
                {"strikeID": "7", "item": ''' + self.BuySide[7].getJson() + '''},
                {"strikeID": "8", "item": ''' + self.BuySide[8].getJson() + '''}
            ],
            "SellSide":[
                {"strikeID": "0", "item": ''' + self.SellSide[0].getJson() + '''},
                {"strikeID": "1", "item": ''' + self.SellSide[1].getJson() + '''},
                {"strikeID": "2", "item": ''' + self.SellSide[2].getJson() + '''},
                {"strikeID": "3", "item": ''' + self.SellSide[3].getJson() + '''},
                {"strikeID": "4", "item": ''' + self.SellSide[4].getJson() + '''},
                {"strikeID": "5", "item": ''' + self.SellSide[5].getJson() + '''},
                {"strikeID": "6", "item": ''' + self.SellSide[6].getJson() + '''},
                {"strikeID": "7", "item": ''' + self.SellSide[7].getJson() + '''},
                {"strikeID": "8", "item": ''' + self.SellSide[8].getJson() + '''}
            ]
        '''
        
        return x


    def updateOption( self, strikeID,  side,  price,  quantity, operator):
        
        if side == 'B':
            for k in range(self.BuySide[strikeID].getPositionsCount()): #Gibt es schon eine Position?
                if self.BuySide[strikeID].getItemAtIndex(k).getPrice() == price:
                    if operator == "+":
                        self.BuySide[strikeID].getItemAtIndex(k).setQty(self.BuySide[strikeID].getItemAtIndex(k).getQty() + quantity)
                        return "500"
                    elif operator == "-":
                        if self.BuySide[strikeID].getItemAtIndex(k).getQty() - quantity < 0:
                            print("Error nicht genug Stücke")
                            return "501"
                        elif self.BuySide[strikeID].getItemAtIndex(k).getQty() - quantity == 0:
                            self.BuySide[strikeID].deletItemAtIndex(k)
                            return "500"
                        else:
                            self.BuySide[strikeID].getItemAtIndex(k).setQty(self.BuySide[strikeID].getItemAtIndex(k).getQty() - quantity)
                        return "500"
            if operator == "+":
                self.BuySide[strikeID].createNewPosition(price,quantity) #Wenn keine Position neue erstellen
                return "500"
            else:
                print("Error keine Position zu hitten")
                return "502"


        elif side == 'S':
            for k in range(self.SellSide[strikeID].getPositionsCount()):  # Gibt es schon eine Position?
                if self.SellSide[strikeID].getItemAtIndex(k).getPrice() == price:
                    if operator == "+":
                        self.SellSide[strikeID].getItemAtIndex(k).setQty(self.SellSide[strikeID].getItemAtIndex(k).getQty() + quantity)
                        return "500"
                    elif operator == "-":
                        if self.SellSide[strikeID].getItemAtIndex(k).getQty() - quantity < 0:
                            print("Error nicht genug Stücke")
                            return "501"
                        elif self.SellSide[strikeID].getItemAtIndex(k).getQty() - quantity == 0:
                            self.SellSide[strikeID].deletItemAtIndex(k)
                            return "500"
                        else:
                            self.SellSide[strikeID].getItemAtIndex(k).setQty(self.SellSide[strikeID].getItemAtIndex(k).getQty() - quantity)
                            return "500"

            if operator == "+":
                self.SellSide[strikeID].createNewPosition(price, quantity)  # Wenn keine Position neue erstellen
                return "500"
            else:
                print("Error keine Position zu hitten")
                return "502"