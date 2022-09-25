import pathlib
import json

class FileReader:
    def __init__(self):
        self.path = pathlib.Path(__file__).resolve()
        self.UserFile = "userConf.txt"
        self.userConf = []

    def getUserConf(self):
        return self.userConf

    def innitUserFile(self):
        f = open(str(self.path)[:-13] + self.UserFile, "r")

        userConf = []

        for line in f:
            userConf.append(json.loads(line))

        f.close()

        self.userConf = userConf

    def writeNewUser(self,username, password):
        f = open(str(self.path)[:-13] + self.UserFile, "a")

        f.write('{"username":"' + username + '","password":"' + password + '","MM": 0}\n')

        f.close()

        self.userConf.append({"username": username, "password": password, "MM": 0})