import asyncio
import websockets
from OrderBookItem import OrderBookItem
import json
from config import user_conf




CLIENTS = set()

LoggedInUser = []

OrderBooks = [OrderBookItem("Marco"), OrderBookItem("Matthias")]
Map = {0: "Marco", 1:  "Matthias"}

OrderBooks[0].updateContract(0, "C","B", 0.56, 2000,"+")
OrderBooks[0].updateContract(0, "C","B", 0.51, 2000,"+")
OrderBooks[0].updateContract(0, "C","B", 0.45, 2000,"+")
OrderBooks[0].updateContract(1, "C","B", 0.56, 2000,"+")
OrderBooks[0].updateContract(2, "C","B", 0.56, 2000,"+")

def checkPassword(username, password):
    for i in user_conf:
        if i['username'] == username and i['password'] == password:
            return True

    return False


def getOrderBooksJson():
    x = "["
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

            elif message[:2] == "OB":

                j = json.loads(message[2:])

                indexOfMM = list(Map.keys())[list(Map.values()).index(j['MM'])]

                OrderBooks[indexOfMM].updateContract(j['strikeID'], j['optionType'],j['side'], j['price'], j['quantity'], j['operator'])

                await broadcast(getOrderBooksJson())
            elif message[:3] == "QBI":

                await websocket.send(getOrderBooksJson())

            elif message[:2] == "QB":
                print(message[2:])

                j = json.loads(message[2:])

                indexOfMM = list(Map.keys())[list(Map.values()).index(j['MM'])]

                OrderBooks[indexOfMM].updateContract(j['strikeID'], j['optionType'],j['side'], j['price'], j['quantity'], j['operator'])

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
    async with websockets.serve(handler, "192.168.0.155", 12345):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())