import asyncio
import websockets
from OrderBookItem import OrderBookItem
import json
from config import user_conf
from User import User

CLIENTS = set()
UserList = []

OrderBooks = [OrderBookItem("mpl"), OrderBookItem("mkr")]
Map = {0: "mpl", 1:  "mkr"}

a = OrderBooks[0].updateContract(0, "C","B", 0.56, 2000,"+")
b = OrderBooks[0].updateContract(0, "C","B", 0.51, 2000,"+")
c = OrderBooks[0].updateContract(0, "C","B", 0.45, 2000,"+")
d = OrderBooks[0].updateContract(1, "C","B", 0.56, 2000,"+")
e = OrderBooks[0].updateContract(2, "C","B", 0.56, 2000,"+")

def innitUser():
    for i in user_conf:
        UserList.append(User(i['username']))

def getUserByName(username):
    for i in UserList:
        if username == i.getUserName():
            return i

def checkPassword(username, password):
    for i in user_conf:
        if i['username'] == username and i['password'] == password:
            return True

    return False
def getAllPortfolioJson():
    x = "PortfolioUpdate["
    for i in UserList:
        x = x + '{"'+i.getUserName() + '":' + i.returnPortfolioPositionsJson() + '},'

    x = x[:-1]

    x = x + "]"

    return x

def getOrderBooksJson():
    x = "OrderUpdateResponse["
    for i in OrderBooks:
        x = x + i.toJson() + ","

    x = x[:-1]

    x = x + "]"

    return x

async def handler(websocket):

    CLIENTS.add(websocket)

    try:
        async for message in websocket:
            print(message)
            print(len(CLIENTS))

            if message == "OBI":

                await websocket.send(getOrderBooksJson())
            elif message[:5] == "LOGIN":
                j = json.loads(message[5:])

                if checkPassword(j['user'], j['password']):
                    await websocket.send("200")
                else:
                    await websocket.send("401")
            elif message[:3] == "QBI":

                await websocket.send(getOrderBooksJson())
            elif message[:2] == "PI":
                j = json.loads(message[2:])

                await websocket.send( getUserByName(j['user']).returnPortfolioPositionsJson())
            elif message[:2] == "OB":

                j = json.loads(message[2:])

                indexOfMM = list(Map.keys())[list(Map.values()).index(j['MM'])]

                rc = OrderBooks[indexOfMM].updateContract(j['strikeID'], j['optionType'],j['side'], j['price'], j['quantity'], j['operator'])

                if rc == "500":
                    try:

                        getUserByName(j['username']).addPortfolioPosition(j['strikeID'], j['optionType'], j['side'],
                                                                          j['price'], j['quantity'], j['MM'])

                        if j['side'] == "B":
                            side = "S"
                        else:
                            side = "B"

                        getUserByName(j['MM']).addPortfolioPosition(j['strikeID'], j['optionType'], side,
                                                                          j['price'], j['quantity'], j['username'])
                    except Exception as e:
                        print(e)

                    await websocket.send(rc) #Kaufbestätigun schicken
                    await broadcast(getOrderBooksJson()) #Broadcast alle Updates im Orderbook/Qoutebook
                    await broadcast(getAllPortfolioJson()) #Broadcast alle Updates zu allen Portfolios
                    print(getAllPortfolioJson())
                else:
                    await websocket.send(rc) #Bei Fehler dem WS Melden


            elif message[:2] == "QB":
                print(message[2:])

                j = json.loads(message[2:])

                indexOfMM = list(Map.keys())[list(Map.values()).index(j['MM'])]

                rc = OrderBooks[indexOfMM].updateContract(j['strikeID'], j['optionType'],j['side'], j['price'], j['quantity'], j['operator'])

                await broadcast(getOrderBooksJson())


            pass
    finally:
        CLIENTS.remove(websocket)

async def broadcast(message):
    for websocket in CLIENTS.copy():
        try:
            await websocket.send(message)
        except websockets.ConnectionClosed:
            pass

async def broadcastExcept(message,websocket_sender):
    for websocket in CLIENTS.copy():
        if websocket == websocket_sender:
            continue
        try:
            await websocket.send(message)
        except websockets.ConnectionClosed:
            pass


async def main():
    innitUser()
    async with websockets.serve(handler, "192.168.0.155", 12345):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())