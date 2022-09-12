from OrderBookSide import OrderBookSide


class OrderBookItem:
    def __init__(self, MM):
        self.MM = MM
        self.CallSide = OrderBookSide()
        self.PutSide = OrderBookSide()
        #self.StrikeMap = { {0, "12:00"}, {1, "12:15"} , {2, "12:30"} , {3, "12:45"} ,{4, "13:00"},{5, "13:15"} ,{6, "13:30"} ,{7, "13:45"} ,{8, "14:00"} }

    def updateContract(self, strikeID, optionType, side, price, quantity, operator):

        if not (optionType == "C" or optionType == "P") or not (side == "B" or side == "S") or quantity == 0:
            return

        if optionType == 'C':
            self.CallSide.updateOption(strikeID, side, price, quantity, operator)
        elif optionType == 'P':
            self.PutSide.updateOption(strikeID, side, price, quantity, operator)

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
            }
        }  '''

        return x

