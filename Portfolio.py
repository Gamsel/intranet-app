class Portfolio:
    def __init__(self):
        self.positions = []

    def loadPositions(self, username):
        print("load")

    def getPositionJson(self):
        if len(self.positions) == 0:

            y = '420'

        else:
            if len(self.positions) == 1:
                y = ''' [{
                         "strikeID": ''' + str(self.positions[0][0]) + ''',
                         "optionType": "''' + str(self.positions[0][1]) + '''",
                         "side": "''' + str(self.positions[0][2]) + '''",
                         "price": ''' + str(self.positions[0][3]) + ''',
                         "quantity": ''' + str(self.positions[0][4]) + ''',
                         "cp": "''' + str(self.positions[0][5]) + '''"
                        }] '''
            else:
                y = '['
                for i in range(len(self.positions)):
                    y = y + ''' {
                                 "strikeID": ''' + str(self.positions[i][0]) + ''',
                                 "optionType": "''' + str(self.positions[i][1]) + '''",
                                 "side": "''' + str(self.positions[i][2]) + '''",
                                 "price": ''' + str(self.positions[i][3]) + ''',
                                 "quantity": ''' + str(self.positions[i][4]) + ''',
                                 "cp": "''' + str(self.positions[i][5]) + '''"
                                 },'''
                y = y[:-1]

                y = y + ']'

        return y

    def addPosition(self, strikeID, optionType, side, price, quantity,cp):
        found = None
        cnt = 0
        for i in self.positions:
            if i[0] == strikeID and i[1] == optionType and i[2] == side and i[3] == price and i[5] == cp:
                found = i
                break
            cnt += 1

        if found is None:
            self.positions.append([strikeID, optionType, side, price, quantity,cp])
        else:
            self.positions[cnt][4] = self.positions[cnt][4] + quantity
