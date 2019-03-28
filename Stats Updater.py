import os
import time
import glob
import sc2reader

names = ["Rob"]
pvz = 0
pvt = 0
pvp = 0

go = True
pathToStarcraftReplays = "C:/Users/Robbie Plata/Documents/StarCraft II/Accounts/63292986/1-S2-1-950222/Replays/Multiplayer"


def process(replay):
    winner = ""
    winnerrace = ""
    loser = ""
    loserrace = ""
    for team in replay.teams:
        for player in team:
            if player.name in str(replay.winner):
                winner = player.name
                winnerrace = player.pick_race
            else:
                loser = player.name
                loserrace = player.pick_race
    try:
        if winner in names:
            if loserrace == "Terran":
                readpvtfile = open("pvt.txt", "r")
                pvt = readpvtfile.read()
                wins = int(pvt.split('-')[0])
                losses = int(pvt.split('-')[1])
                readpvtfile.close()
                writepvtfile = open("pvt.txt", "w")
                wins = wins + 1
                writepvtfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writepvtfile.close()

            if loserrace == "Zerg":
                readpvzfile = open("pvz.txt", "r")
                pvz = readpvzfile.read()
                wins = int(pvz.split('-')[0])
                losses = int(pvz.split('-')[1])
                readpvzfile.close()
                writepvzfile = open("pvz.txt", "w")
                wins = wins + 1
                writepvzfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writepvzfile.close()

            if loserrace == "Protoss":
                readpvpfile = open("pvp.txt", "r")
                pvp = readpvpfile.read()
                wins = int(pvp.split('-')[0])
                losses = int(pvp.split('-')[1])
                readpvpfile.close()
                writepvpfile = open("pvp.txt", "w")
                wins = wins + 1
                writepvpfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writepvpfile.close()

        else:
            if winnerrace == "Terran":
                readpvtfile = open("pvt.txt", "r")
                pvt = readpvtfile.read()
                wins = int(pvt.split('-')[0])
                losses = int(pvt.split('-')[1])
                readpvtfile.close()
                writepvtfile = open("pvt.txt", "w")
                losses = losses + 1
                writepvtfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writepvtfile.close()

            if winnerrace == "Zerg":
                readpvzfile = open("pvz.txt", "r")
                pvz = readpvzfile.read()
                wins = int(pvz.split('-')[0])
                losses = int(pvz.split('-')[1])
                readpvzfile.close()
                writepvzfile = open("pvz.txt", "w")
                losses = losses + 1
                writepvzfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writepvzfile.close()

            if winnerrace == "Protoss":
                readpvpfile = open("pvp.txt", "r")
                pvp = readpvpfile.read()
                wins = int(pvp.split('-')[0])
                losses = int(pvp.split('-')[1])
                readpvpfile.close()
                writepvpfile = open("pvp.txt", "w")
                losses = losses + 1
                writepvpfile.write(str(wins) + '-' + str(losses))
                print(str(wins) + '-' + str(losses))
                writepvpfile.close()

    except Exception as err:
        print(err)


writepvtfile = open("pvt.txt", "w")
writepvzfile = open("pvz.txt", "w")
writepvpfile = open("pvp.txt", "w")
writepvtfile.write("0-0")
writepvzfile.write("0-0")
writepvpfile.write("0-0")
writepvtfile.close()
writepvzfile.close()
writepvpfile.close()

while(go):
    path, dirs, files = next(os.walk(pathToStarcraftReplays))
    file_count = len(files)
    print("file count: ", file_count)

    time.sleep(5)
    path, dirs, files = next(os.walk(pathToStarcraftReplays))
    newfile_count = len(files)
    print("new file count: " , newfile_count)

    if newfile_count > file_count:
        files = [os.path.join(pathToStarcraftReplays, x) for x in os.listdir(pathToStarcraftReplays) if x.endswith(".SC2Replay")]
        newest = max(files, key=os.path.getctime)
        print("newest ", newest)
        currentReplayPath = newest
        replay = sc2reader.load_replay(currentReplayPath)
        process(replay)


