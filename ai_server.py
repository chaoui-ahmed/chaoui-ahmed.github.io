## libraries

from socket import * #used for communication
from time import *
from json import * #used for packet translation
import json
import copy

import threading
import time #used for the timeout
import ast #used for safer version of eval()
import re #for buffer functions

## global variables

timeout = 60    #timeout to ensure the opponent does not take too much time to answer (here 60 seconds)
last_message = None # store the last message sent, in case we have to send it back if we reach timeout
last_move = [0,0] #store the last move we played in case we have to take it back if it is detected as illegal
game_on = False
serverPort = 4321 #updated port to match system convention
host= "localhost" #need to do an interface in order to choose the opponent

myboard = [[".",".",".",".",".",".",".","."],
           [".",".",".",".",".",".",".","."],
           [".",".",".",".",".",".",".","."],
           [".",".",".","W","B",".",".","."],
           [".",".",".","B","W",".",".","."],
           [".",".",".",".",".",".",".","."],
           [".",".",".",".",".",".",".","."],
           [".",".",".",".",".",".",".","."]]

mybuffer = "[]"

## programms
##AI part
import random
import copy

from enum import Enum

class Player(Enum):
    EMPTY = 0
    LIGHT = 1
    DARK = 2

## Greedy algorithm
def make_ai_move_glouton(board, player):
    valid_moves = get_valid_moves_for_board(board, player)
    if not valid_moves: # AI cannot play
        return None
    
    best_move = None
    max_score = -1
    for row, col in valid_moves:
        score = evaluate_move(board, row, col, player)
        if (row, col) in [(0, 0), (0, 7), (7, 0), (7, 7)]: # Add a bonus for corners
            score += 10
        if score > max_score:
            max_score = score
            best_move = (row, col)
    return best_move

## Minimax alpha beta algorithm
def make_ai_move_minimax(board, player, depth=3):
    valid_moves = get_valid_moves_for_board(board, player)
    if not valid_moves:
        return None

    def minimax(board, player, depth, alpha, beta):
        valid_moves = get_valid_moves_for_board(board, player) # Get valid moves for the recursion step
        if depth == 0 or not valid_moves: # End of recursion
            return evaluate_board(board), None

        if player == Player.DARK:
            max_eval = float('-inf') # Initialize max_eval to negative infinity
            best_move = None
            for move in valid_moves:
                new_board = simulate_move(board, move, player) # Simulate the move
                eval, _ = minimax(new_board, Player.LIGHT, depth-1, alpha, beta) # Recursion
                if eval > max_eval:
                    max_eval = eval
                    best_move = move
                alpha = max(alpha, eval) # Update alpha with the max value
                if beta <= alpha: # Alpha-beta pruning 
                    break
            return max_eval, best_move
        else:
            min_eval = float('inf') # Initialize min_eval to positive infinity
            best_move = None
            for move in valid_moves:
                new_board = simulate_move(board, move, player) # Simulate the move
                eval, _ = minimax(new_board, Player.DARK, depth-1, alpha, beta) # Recursion
                if eval < min_eval:
                    min_eval = eval
                    best_move = move
                beta = min(beta, eval) # Update beta with the min value
                if beta <= alpha: # Alpha-beta pruning
                    break
            return min_eval, best_move

    _, best_move = minimax(board, player, depth, float('-inf'), float('inf')) # Catch the best move for the player
    return best_move

## Monte Carlo algorithm
def make_ai_move_monte_carlo(board, player, simulations=64): # Easy to explain, if someone wants I can explain
    valid_moves = get_valid_moves_for_board(board, player)
    if not valid_moves:
        return None

    def monte_carlo_simulation(board, move, player, n_sim=simulations):
        results = []
        for _ in range(n_sim):
            sim_board = simulate_move(board, move, player)
            sim_player = Player.LIGHT if player == Player.DARK else Player.DARK
            while True:
                moves = get_valid_moves_for_board(sim_board, sim_player)
                if not moves:
                    sim_player = Player.LIGHT if sim_player == Player.DARK else Player.DARK
                    moves = get_valid_moves_for_board(sim_board, sim_player)
                    if not moves:
                        break
                move_sim = random.choice(moves)
                sim_board = simulate_move(sim_board, move_sim, sim_player)
                sim_player = Player.LIGHT if sim_player == Player.DARK else Player.DARK
            light = sum(cell == Player.LIGHT for row in sim_board for cell in row)
            dark = sum(cell == Player.DARK for row in sim_board for cell in row)
            if dark > light:
                results.append(1)
            elif light > dark:
                results.append(-1)
            else:
                results.append(0)
        return sum(results) / n_sim

    best_score = float('-inf')
    best_move = None
    for move in valid_moves:
        score = monte_carlo_simulation(board, move, player, simulations)
        if score > best_score:
            best_score = score
            best_move = move
    return best_move

## Hybrid algorithm
def make_ai_move_hybrid(board, player): # Hybrid algorithm that chooses between Minimax and Monte Carlo based on the number of pieces on the board
    total_pieces = sum(cell != Player.EMPTY for row in board for cell in row)
    if total_pieces < 20:
        return make_ai_move_minimax(board, player, depth=5)
    else:
        return make_ai_move_monte_carlo(board, player, simulations=64)

## return the possible moves for the player
def get_valid_moves_for_board(board, player):
    valid_moves = []
    for row in range(len(board)):
        for col in range(len(board)):
            if is_valid_move_on_board(board, row, col, player):
                valid_moves.append((row, col))
    return valid_moves


## Check if the move is valid or not
def is_valid_move_on_board(board, row, col, player):
    if board[row][col] != Player.EMPTY:
        return False
    opponent = Player.DARK if player == Player.LIGHT else Player.LIGHT
    directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    for dx, dy in directions:
        x, y = row + dx, col + dy
        if 0 <= x < len(board) and 0 <= y < len(board) and board[x][y] == opponent:
            x += dx
            y += dy
            while 0 <= x < len(board) and 0 <= y < len(board) and board[x][y] == opponent:
                x += dx
                y += dy
            if 0 <= x < len(board) and 0 <= y < len(board) and board[x][y] == player:
                return True
    return False

## evaluate the score of a move
def evaluate_move(board, row, col, player):
    opponent = Player.DARK if player == Player.LIGHT else Player.LIGHT
    directions = [
        (-1, -1), (-1, 0), (-1, 1),
        (0, -1), (0, 1),
        (1, -1), (1, 0), (1, 1)
    ]
    score = 0
    for dx, dy in directions:
        x, y = row + dx, col + dy
        count = 0
        while (0 <= x < len(board) and 0 <= y < len(board) and board[x][y] == opponent):
            x += dx
            y += dy
            count += 1
        if (count > 0 and 0 <= x < len(board) and 0 <= y < len(board) and board[x][y] == player):
            score += count
    return score

def simulate_move(board, move, player): # Simulate a move on the board
    new_board = copy.deepcopy(board)
    row, col = move
    new_board[row][col] = player # Place the piece
    opponent = Player.DARK if player == Player.LIGHT else Player.LIGHT
    directions = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]
    for dx, dy in directions: # Check all directions
        pieces_to_flip = []
        x, y = row + dx, col + dy
        while 0 <= x < len(board) and 0 <= y < len(board) and new_board[x][y] == opponent: # Check if the opponent's pieces can be flipped
            pieces_to_flip.append((x, y)) # Add to the list of pieces to flip
            x += dx
            y += dy
        if pieces_to_flip and 0 <= x < len(board) and 0 <= y < len(board) and new_board[x][y] == player: # Check if the last piece is the player's piece
            for fx, fy in pieces_to_flip:
                new_board[fx][fy] = player # Flip the pieces
    return new_board

## to help minimax algortihm for a final position
def evaluate_board(board):
    corners = [(0,0), (0,7), (7,0), (7,7)]
    corner_score = 0
    for x, y in corners: # Add a score for the corners (strategic positions)
        if board[x][y] == Player.DARK:
            corner_score += 25
        elif board[x][y] == Player.LIGHT:
            corner_score -= 25
    dark_moves = len(get_valid_moves_for_board(board, Player.DARK))
    light_moves = len(get_valid_moves_for_board(board, Player.LIGHT))
    mobility_score = 0
    if dark_moves + light_moves != 0:
        mobility_score = 10 * (dark_moves - light_moves) / (dark_moves + light_moves) # More moves = better
    light = sum(cell == Player.LIGHT for row in board for cell in row)
    dark = sum(cell == Player.DARK for row in board for cell in row)
    piece_score = dark - light # More pieces = better
    return corner_score + mobility_score + piece_score

##Communication Part
## tools
letter_to_number = {"A" : 0, "B" : 1, "C" : 2, "D" : 3, "E" : 4, "F" : 5, "G" : 6, "H" : 7}

def move_to_coord(move): # converts a normal move to a couple of coordinates (B1 becomes (1,1))
    mymatrixmove = list(move)
    print("move_to_coord:",mymatrixmove)
    if len(mymatrixmove) != 2 : #checks that the length of the string received is 2
        return (0,0,False)
    if mymatrixmove[0] in letter_to_number and 0<=int(mymatrixmove[1])<=7 : #checks if the move is on the board
        mymatrixmove[0] = letter_to_number[mymatrixmove[0]]
        return (int(mymatrixmove[1])-1,int(mymatrixmove[0]),True) #Letters represent columns and numbers rows in Othello
    else :
        return (0,0,False)


def coord_to_move(row, col):
    col_letter = chr(ord('A') + col)  # Convert column index (0-7) to letter A-H
    row_number = row + 1              # Convert row index (0-7) to number 1-8
    return f"{col_letter}{row_number}"


#memo :     y=0 y=1
#            A   B  C  D  E  F  G ...
#   x=0  1  [".",".",".",".",".",".",".","."],
#   x=1  2  [".",".",".",".",".",".",".","."],
#        3  [".",".",".",".",".",".",".","."],
#        4  [".",".",".","W","B",".",".","."],
#        .  [".",".",".","B","W",".",".","."],
#        .  [".",".",".",".",".",".",".","."],
#           [".",".",".",".",".",".",".","."],
#           [".",".",".",".",".",".",".","."]
# 

def convert_board(board):
    symbol_to_int = {
        ".": Player.EMPTY,
        "W": Player.LIGHT,
        "B": Player.DARK
    }
    return [[symbol_to_int[cell] for cell in row] for row in board]

def most_pawn(board):
    nb_B = 0
    nb_W = 0
    for i in range(8):
        for j in range(8):
            if board[i][j] == "W" :
                nb_W += 1
            elif board[i][j] == "B" :
                nb_B += 1
    if nb_W > nb_B :
        return "W"
    elif nb_B > nb_W :
        return "B"
    else : 
        return "NONE"


def get_valid_moves_with_vectors(board, color):
    directions = [(-1, 0), (-1, 1), (0, 1), (1, 1),
                  (1, 0), (1, -1), (0, -1), (-1, -1)]
    
    opponent = "B" if color == "W" else "W"
    valid_moves = {}

    for x in range(8):
        for y in range(8):
            if board[x][y] != ".":
                continue

            valid_dirs = []
            for dx, dy in directions:
                nx, ny = x + dx, y + dy
                found_opponent = False

                while 0 <= nx < 8 and 0 <= ny < 8 and board[nx][ny] == opponent:
                    nx += dx
                    ny += dy
                    found_opponent = True

                if found_opponent and 0 <= nx < 8 and 0 <= ny < 8 and board[nx][ny] == color:
                    valid_dirs.append((dx, dy))

            if valid_dirs:
                col_letter = chr(ord("A") + y)
                move_str = f"{col_letter}{x+1}"
                valid_moves[move_str] = valid_dirs

    return valid_moves


def add_buffer(buffer: str, new_move: str, player: str) -> str:
    """
    Adds a new move to the buffer string for the given player.
    
    Parameters:
    - buffer: str, current buffer as a string like "[(E4,W),(B5,B),(E3,W)]"
    - new_move: str, the new move position like "C3"
    - player: str, the player making the move ("B" or "W")
    
    Returns:
    - str, updated buffer string
    """
    # Format the new move into a string representation (e.g., (C3,B))
    new_move_str = f"({new_move},{player})"

    # Clean the buffer brackets and split into existing moves
    inner = buffer.strip()[1:-1].strip()
    moves = [s.strip() for s in re.findall(r'$$[^()]+$$', inner)] if inner else []

    # Append the new move to the list
    moves.append(new_move_str)

    # Reconstruct the buffer string with updated moves
    updated_buffer = "[" + ",".join(moves) + "]"
    return updated_buffer


def remove_buffer(buffer):
    """
    Removes the last (rightmost) move from the buffer string and returns the updated buffer string.
    Assumes buffer format: '[(E4,W),(B5,B),(E3,W)]'
    """
    # Match all move entries using regex: (E4,W), etc.
    moves = re.findall(r'$$\s*([A-H][1-8])\s*,\s*([BW])\s*$$', buffer)

    if not moves:
        return "[]"

    # Remove the last move
    updated_moves = moves[:-1]

    # Rebuild buffer string
    new_buffer = "[" + ",".join(f"({case},{player})" for case, player in updated_moves) + "]"
    return new_buffer

def timer(connection):
    global response_received
    print(f"Timer started. Waiting {timeout} seconds for a response.\n")
    for i in range(timeout, 0, -1):
        time.sleep(1)  # wait for 1 second
        if i % 5 == 0 : #print the time remaining all the 5 seconds
            print(f"{i} seconds remaining...\n") 
        if response_received:
            return
    print("Timeout, the opponent didn't respond in time\n")
    answer = "-4"
    connection.send(answer.encode())


def server():
    global mybuffer
    global game_on
    global response_received
    global mycolor
    global op_color
    global myaicolor
    global op_aicolor
    global last_response
    global logs
    global connection
    

    logs = []   #to review the game (the packets exchanged) if any issue occurs
    mycolor = "B" # we (communication responsibles) deciced to attribute the color black to the server by default
    op_color = "W"
    myaicolor = Player.DARK
    op_aicolor = Player.LIGHT
    response_received = False
    serverSocket = socket(AF_INET,SOCK_STREAM)
    serverSocket.bind(("",serverPort))
    serverSocket.listen(1)
    print ("The server is ready to receive\n")
    connection, addr = serverSocket.accept()
    last_response = [-1]
    game_on = True
    
    while game_on:

        message = connection.recv(1024).decode()    #wait for a messsage from the opponent

        if message : # we received a response so we can stop the timer 
            response_received = True

        else :
            print("The server closed the connection")
            game_on = False

        logs.append(message) #add the opponent's last message to the logs

        message = message.split("|") #need to "unpack" the data of the message
        answer = packet_processing(message) #process the message and create the answer
        logs.append(answer) #add our last message to the logs
        global saved_rcv # save the message received in case we have process it again
        saved_rcv = message

        global last_message #make sure the message is saved outside the function
        last_message = answer   #update the last message
        response_received = False
        connection.send(answer.encode())    #send our answer to the opponent
        timer_thread = threading.Thread(target=timer, daemon=True, args=(connection,)) #daemon here to ensure background programm exits when main exits
        timer_thread.start()
    connection.close()
    print("The connection was closed")

def packet_processing(message):
    global last_move
    global mybuffer
    global myboard
    global game_on
    global latest_player
    global pieces_to_flip
    global last_flipped
    global last_response

    last_flipped = []

    if len(message) == 0 :
        print("The packet received is empty\n")
        response = "-5"


    elif message[0] == "0" : #initialization of the board
        if logs != ["0"] :
            print("The opponent illegaly tries to initialize the board during the game\n")
            response = "-5" #informs the opponent that he cannot initialize an already initialized game
        else :
            print("Game launched, make the first move")
            print(["/","A","B","C","D","E","F","G","H"])
            for i in range(8):
                print([str(i+1)]+myboard[i])   #display the board 
            move_validation = True
            mypossiblemoves = get_valid_moves_with_vectors(myboard,mycolor)
            if mypossiblemoves == {} :
                response = "1|NONE"
            else :
                while move_validation : #wait for the user to give a legal move
                    myboard_for_ai = convert_board(myboard) #need to adapt the format of the board to the one used by the AI
                    print("You can play on these cases :",mypossiblemoves,"\n", flush=True) #flush ensures everything is printed before the incoming input
                    x,y = make_ai_move_hybrid(myboard_for_ai,myaicolor)
                    mymove = coord_to_move(x,y)
                    print("The AI suggests the move",mymove)
                    if mymove in mypossiblemoves : #legal move chosen
                        move_validation = False
                    
                x,y,check= move_to_coord(mymove)

                mybuffer = add_buffer(mybuffer, mymove, mycolor)
                last_flipped.append((x,y))

                myboard[x][y] = mycolor # place a move at this coordinates
                for dx, dy in mypossiblemoves[mymove]:  # For each direction where flips are possible
                    nx, ny = x + dx, y + dy
                    pieces_to_flip = []

                    while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                        pieces_to_flip.append((nx, ny))  # Store positions to flip later
                        nx += dx
                        ny += dy

                    # If the next piece is ours, we confirm the capture and flip
                    if 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == mycolor:
                        for fx, fy in pieces_to_flip:
                            myboard[fx][fy] = mycolor
                            last_flipped.append((fx,fy))

                print(["/","A","B","C","D","E","F","G","H"])
                for i in range(8):
                    print([str(i+1)]+myboard[i])
                    
                mystrboard = str(myboard)
                response = "1|" + mymove + "|" + mycolor
           


    elif message[0] == "1" : #received the move from the opponent

        if len(message) != 3 : #checks the format of the packet
            response = "-5"
            print("format of received packet is wrong\n")
        
        else : 
            op_move = message[1] #retrieve opponent's move 
            #op_board = message[2] #retrieve the opponent's board after opponent's move
            #op_buffer = message[3] #retrieve the opponent's buffer after opponent's move
            latest_player = message[2] #retrieve the player that played this move
           # op_matrix = json.loads(op_board)
            valid_board = copy.deepcopy(myboard)
            #valid_buffer = mybuffer

            if op_move == None :    #if my opponent did not play anything
                if get_valid_moves_with_vectors(myboard,mycolor) == {} :# if neither me can't play anything = end of the game
                    winner = most_pawn(myboard)
                    response = "2|"+winner
                    game_on = False
                else : # our opponent did not want/could not play so it is our turn !
                    print(["/","A","B","C","D","E","F","G","H"])
                    for i in range(8):
                        print([str(i+1)]+myboard[i])   #display the board 
                    move_validation = True
                    mypossiblemoves = get_valid_moves_with_vectors(myboard,mycolor)
                    if mypossiblemoves == {} :
                            response = "1|NONE"
                    else :
                        while move_validation : #wait for the user to give a legal move
                            myboard_for_ai = convert_board(myboard) #need to adapt the format of the board to the one used by the AI
                            print("You can play on these cases :",mypossiblemoves,"\n", flush=True) #flush ensures everything is printed before the incoming input
                            x,y = make_ai_move_hybrid(myboard_for_ai,myaicolor)
                            mymove = coord_to_move(x,y)
                            print("The AI suggests the move",mymove)
                            _ = input("Continue ?:\n")#the move I want to play
                            if mymove in mypossiblemoves : #legal move chosen
                                move_validation = False
                        x,y,check= move_to_coord(mymove)

                        mybuffer = add_buffer(mybuffer, mymove, mycolor)

                        myboard[x][y] = mycolor # place a move at this coordinates
                        for dx, dy in mypossiblemoves[mymove]: #flipping all the corresponding coins
                            nx, ny = x + dx, y + dy
                            myboard[x][y] = mycolor

                            while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                                nx += dx
                                ny += dy
                                myboard[x][y] = mycolor
                        print(["/","A","B","C","D","E","F","G","H"])
                        for i in range(8):
                            print([str(i+1)]+myboard[i])
                        #mystrboard = str(myboard)
                        response = "1|" + mymove + "|" + mycolor

            else : #we need to analyse the move of the opponent
                
                x,y,check=move_to_coord(op_move) # convert the pair letter+number into number+number

                if not(check) : # pawn outside the board
                    print("opponent's move :",op_move,"is not legal\n")
                    response= "-3"
                else :
                    
                    valid_board[x][y]=latest_player #simulate the opponent's move on my board (doesn't matter wether it is legal or not because we test it afterward)
                    #valid_buffer = add_buffer(mybuffer,op_move,op_color)


                    if not(op_move in get_valid_moves_with_vectors(myboard, op_color)) : #checks if the opponent's move is legal #the list possible moves is not yet defined and should be computed before this line
                        print("opponent's move :",op_move,"is not legal\n")
                        response = "-3"
                #  elif valid_board != op_matrix : #checks if opponent's board matches with his announced move 
                #      print("opponent's board does not match with its move\n")
                #     response = "-2"
                    elif latest_player not in ("B", "W"): #checks if the player announced is a known one
                        print("lastest player is not B neither W\n")
                        response = "-5"
                #    elif op_buffer != valid_buffer :
                #        print("opponent's board does not match with its move\n")
                #        response = "-5"
                    else : #everything's alright, we can update our board and buffer and then prepare our next move
                        op_possiblemoves = get_valid_moves_with_vectors(myboard,op_color)
                        mybuffer = add_buffer(mybuffer,op_move,op_color)
                        myboard[x][y] = latest_player
                        print("Placed the opponent coin, now flipping corresponding coins")
                        for dx, dy in op_possiblemoves[op_move]: #flipping all the corresponding coins
                            nx, ny = x + dx, y + dy
                            myboard[x][y] = op_color
                            
                            while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                                nx += dx
                                ny += dy
                                myboard[x][y] = op_color
                        for dx, dy in op_possiblemoves[op_move]:  # For each direction where flips are possible
                            nx, ny = x + dx, y + dy
                            pieces_to_flip = []

                            while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == mycolor:
                                pieces_to_flip.append((nx, ny))  # Store positions to flip later
                                nx += dx
                                ny += dy

                            # If the next piece is ours, we confirm the capture and flip
                            if 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                                for fx, fy in pieces_to_flip:
                                    myboard[fx][fy] = op_color
                                    

                        print(["/","A","B","C","D","E","F","G","H"])
                        for i in range(8):
                            print([str(i+1)]+myboard[i])

                        move_validation = True
                        mypossiblemoves = get_valid_moves_with_vectors(myboard,mycolor)
                        if mypossiblemoves == {} :
                            response = "1|NONE"
                        else :

                            while move_validation : #wait for the user to give a legal move
                                myboard_for_ai = convert_board(myboard) #need to adapt the format of the board to the one used by the AI
                                print("You can play on these cases :",mypossiblemoves,"\n", flush=True) #flush ensures everything is printed before the incoming input
                                x,y = make_ai_move_hybrid(myboard_for_ai,myaicolor)
                                mymove = coord_to_move(x,y)
                                print("The AI sugests the move",mymove)
                                _ = input("Continue ?:\n")#the move I want to play
                                if mymove in mypossiblemoves : #legal move chosen
                                    move_validation = False
                            x,y,check= move_to_coord(mymove)

                            mybuffer = add_buffer(mybuffer, mymove, mycolor)
                            last_flipped.append((x,y))

                            myboard[x][y] = mycolor # place a move at this coordinates
                            for dx, dy in mypossiblemoves[mymove]:  # For each direction where flips are possible
                                nx, ny = x + dx, y + dy
                                pieces_to_flip = []

                                while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                                    pieces_to_flip.append((nx, ny))  # Store positions to flip later
                                    nx += dx
                                    ny += dy

                                # If the next piece is ours, we confirm the capture and flip
                                if 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == mycolor:
                                    for fx, fy in pieces_to_flip:
                                        myboard[fx][fy] = mycolor
                                        last_flipped.append((fx,fy))
                                        
                            print(["/","A","B","C","D","E","F","G","H"])
                            for i in range(8):
                                print([str(i+1)]+myboard[i])
                            #mystrboard = str(myboard)
                            response = "1|" + mymove + "|" + mycolor

    elif message[0] == "2" : #end of the game
        winner = message[1] #retrieve the name of the winner announced by the opponent
        if get_valid_moves_with_vectors(myboard,mycolor) != {} : #If I still have moves to play
            print("opponent announced end of the game though I can still play")
            response = "-5"
        else :
            if most_pawn(myboard) == winner : #checks if the winner is the one announced
                print(winner," won !\n")
                response = "-1"
            else :
                print("wrong winner announced\n")
                response = "-5"

    elif message[0] == "3" : #the opponent resigned
        winner = message[1] #retrieve the name of the winner announced by the opponent
        if winner == mycolor : #checks if the winner is the one announced
            print(winner," won !\n")
            game_on = False
            response = "2|" + mycolor
        else :
            print("wrong winner announced\n")
            response = "-5"

    #elif message[0] == "4" : #the opponent offers a draw
    #    myanswer = input("The opponent offers a draw, do you accept (Y/N):")
    #    response = "6|" + myanswer

    #elif message[0] == "5" : #the opponent wants to take back his last move
    #    op_board = message[1]
    #    myanswer = input("The opponent wants to take back his last move, do you accept (Y/N):")
    #    response = "6|" + myanswer
    
    #elif message[0] == "6" : #the opponent answers to the draw/takeback demand #I guess we need to separate these cases 
    #    op_decision = message[1]
    #    if op_decision == "Y" :
    #        print("The opponent accepted the demand")
    #        game_on = False #temporary, waiting for consensus about the protocol
    #    elif op_decision == "N" :
    #        print("The opponent refused the demand")
    #        game_on = False #temporary, waiting for consensus about the protocol
    #    else :
    #        print("opponent's answer :", op_decision,", not understood\n")
    #        response = "-5" 
    
    elif message[0] == "-2" : #internal error
        print("internal error raised by the opponent\n")
        game_on = False
        response = "-1"
        print("The opponent issued an internal error, we won !")

    elif message[0] == "-3" : #illegal move spotted by the opponent
        mybuffer = remove_buffer(mybuffer)
        print("illegal move detected by the opponent")
        myboard[last_move[0],last_move[1]] ="."
        for x,y in last_flipped :
            myboard[x][y] = "."
        

        
        print(["/","A","B","C","D","E","F","G","H"])
        for i in range(8):
            print([str(i+1)]+myboard[i])

        move_validation = True
        mypossiblemoves = get_valid_moves_with_vectors(myboard,mycolor)
        if mypossiblemoves == {} :
            response = "1|NONE"
        else :
            while move_validation : #wait for the user to give a legal move
                myboard_for_ai = convert_board(myboard) #need to adapt the format of the board to the one used by the AI
                print("You can play on these cases :",mypossiblemoves,"\n", flush=True) #flush ensures everything is printed before the incoming input
                x,y = make_ai_move_hybrid(myboard_for_ai,myaicolor)
                mymove = coord_to_move(x,y)
                print("The AI sugests the move",mymove)
                _ = input("Continue ?:\n")#the move I want to play
                if mymove in mypossiblemoves : #legal move chosen
                    move_validation = False
            x,y,check= move_to_coord(mymove)

            mybuffer = add_buffer(mybuffer, mymove, mycolor)
            last_flipped.append((x,y))

            myboard[x][y] = mycolor # place a move at this coordinates
            for dx, dy in mypossiblemoves[mymove]:  # For each direction where flips are possible
                nx, ny = x + dx, y + dy
                pieces_to_flip = []

                while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                    pieces_to_flip.append((nx, ny))  # Store positions to flip later
                    nx += dx
                    ny += dy

                # If the next piece is ours, we confirm the capture and flip
                if 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == mycolor:
                    for fx, fy in pieces_to_flip:
                        myboard[fx][fy] = mycolor
                        last_flipped.append((fx,fy))
                        
            print(["/","A","B","C","D","E","F","G","H"])
            for i in range(8):
                print([str(i+1)]+myboard[i])
            #mystrboard = str(myboard)
            response = "1|" + mymove + "|" + mycolor

    elif message[0] == "-4" : #you triggered the timeout from the opponent 
        print("opponent's timeout triggered, packet resent")
        listed_last_msg=last_message.split("|")
        move = listed_last_msg[1]
        player = listed_last_msg[2]
        response = "-6|" + str(move) +"|" + str(player)

        #We dont modify the response (same as previous one, except the code which becomes -6) but we resend it at the end of the loop

    elif message[0] == "-5" : #message misunderstood/incorrect
        print("opponent did not understand our packet")
        game_on = False
        response = "-7"
        game_on = False
        for packet in logs :
            print(packet,"\n")
    elif message[0] =="-6" : #the opponent answers to our timeout, we basically do the same pattern as for case 1 (basic move)
        if op_move == None :    #if my opponent did not play anything
            if get_valid_moves_with_vectors(myboard,mycolor) == {} :# if neither me can't play anything = end of the game
                winner = most_pawn(myboard)
                response = "2|"+winner
                game_on = False
            else : # our opponent did not want/could not play so it is our turn !
                print(["/","A","B","C","D","E","F","G","H"])
                for i in range(8):
                    print([str(i+1)]+myboard[i])   #display the board 
                move_validation = True
                mypossiblemoves = get_valid_moves_with_vectors(myboard,mycolor)
                if mypossiblemoves == {} :
                        response = "1|NONE"
                else :
                    while move_validation : #wait for the user to give a legal move
                        myboard_for_ai = convert_board(myboard) #need to adapt the format of the board to the one used by the AI
                        print("You can play on these cases :",mypossiblemoves,"\n", flush=True) #flush ensures everything is printed before the incoming input
                        x,y = make_ai_move_hybrid(myboard_for_ai,myaicolor)
                        mymove = coord_to_move(x,y)
                        print("The AI suggests the move",mymove)
                        _ = input("Continue ?:\n")#the move I want to play
                        if mymove in mypossiblemoves : #legal move chosen
                            move_validation = False
                    x,y,check= move_to_coord(mymove)

                    mybuffer = add_buffer(mybuffer, mymove, mycolor)

                    myboard[x][y] = mycolor # place a move at this coordinates
                    for dx, dy in mypossiblemoves[mymove]: #flipping all the corresponding coins
                        nx, ny = x + dx, y + dy
                        myboard[x][y] = mycolor

                        while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                            nx += dx
                            ny += dy
                            myboard[x][y] = mycolor
                    print(["/","A","B","C","D","E","F","G","H"])
                    for i in range(8):
                        print([str(i+1)]+myboard[i])
                    #mystrboard = str(myboard)
                    response = "1|" + mymove + "|" + mycolor

        else : #we need to analyse the move of the opponent
            
            x,y,check=move_to_coord(op_move) # convert the pair letter+number into number+number

            if not(check) : # pawn outside the board
                print("opponent's move :",op_move,"is not legal\n")
                response= "-3"
            else :
                
                valid_board[x][y]=latest_player #simulate the opponent's move on my board (doesn't matter wether it is legal or not because we test it afterward)
                #valid_buffer = add_buffer(mybuffer,op_move,op_color)


                if not(op_move in get_valid_moves_with_vectors(myboard, op_color)) : #checks if the opponent's move is legal #the list possible moves is not yet defined and should be computed before this line
                    print("opponent's move :",op_move,"is not legal\n")
                    response = "-3"
            #  elif valid_board != op_matrix : #checks if opponent's board matches with his announced move 
            #      print("opponent's board does not match with its move\n")
            #     response = "-2"
                elif latest_player not in ("B", "W"): #checks if the player announced is a known one
                    print("lastest player is not B neither W\n")
                    response = "-5"
            #    elif op_buffer != valid_buffer :
            #        print("opponent's board does not match with its move\n")
            #        response = "-5"
                else : #everything's alright, we can update our board and buffer and then prepare our next move
                    op_possiblemoves = get_valid_moves_with_vectors(myboard,op_color)
                    mybuffer = add_buffer(mybuffer,op_move,op_color)
                    myboard[x][y] = latest_player
                    print("Placed the opponent coin, now flipping corresponding coins")
                    for dx, dy in op_possiblemoves[op_move]: #flipping all the corresponding coins
                        nx, ny = x + dx, y + dy
                        myboard[x][y] = op_color
                        
                        while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                            nx += dx
                            ny += dy
                            myboard[x][y] = op_color
                    for dx, dy in op_possiblemoves[op_move]:  # For each direction where flips are possible
                        nx, ny = x + dx, y + dy
                        pieces_to_flip = []

                        while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == mycolor:
                            pieces_to_flip.append((nx, ny))  # Store positions to flip later
                            nx += dx
                            ny += dy

                        # If the next piece is ours, we confirm the capture and flip
                        if 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                            for fx, fy in pieces_to_flip:
                                myboard[fx][fy] = op_color
                                

                    print(["/","A","B","C","D","E","F","G","H"])
                    for i in range(8):
                        print([str(i+1)]+myboard[i])

                    move_validation = True
                    mypossiblemoves = get_valid_moves_with_vectors(myboard,mycolor)
                    if mypossiblemoves == {} :
                        response = "1|NONE"
                    else :

                        while move_validation : #wait for the user to give a legal move
                            myboard_for_ai = convert_board(myboard) #need to adapt the format of the board to the one used by the AI
                            print("You can play on these cases :",mypossiblemoves,"\n", flush=True) #flush ensures everything is printed before the incoming input
                            x,y = make_ai_move_hybrid(myboard_for_ai,myaicolor)
                            mymove = coord_to_move(x,y)
                            print("The AI sugests the move",mymove)
                            _ = input("Continue ?:\n")#the move I want to play
                            if mymove in mypossiblemoves : #legal move chosen
                                move_validation = False
                        x,y,check= move_to_coord(mymove)

                        mybuffer = add_buffer(mybuffer, mymove, mycolor)
                        last_flipped.append((x,y))

                        myboard[x][y] = mycolor # place a move at this coordinates
                        for dx, dy in mypossiblemoves[mymove]:  # For each direction where flips are possible
                            nx, ny = x + dx, y + dy
                            pieces_to_flip = []

                            while 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == op_color:
                                pieces_to_flip.append((nx, ny))  # Store positions to flip later
                                nx += dx
                                ny += dy

                            # If the next piece is ours, we confirm the capture and flip
                            if 0 <= nx < 8 and 0 <= ny < 8 and myboard[nx][ny] == mycolor:
                                for fx, fy in pieces_to_flip:
                                    myboard[fx][fy] = mycolor
                                    last_flipped.append((fx,fy))
                                    
                        print(["/","A","B","C","D","E","F","G","H"])
                        for i in range(8):
                            print([str(i+1)]+myboard[i])
                        #mystrboard = str(myboard)
                        response = "1|" + mymove + "|" + mycolor
    else : 
        response = "-5"
        print("unknown code received\n")
        game_on = False

    check = response.split("|")
    if int(check[0]) in [-2,-3,-5,-6] and check[0] == last_response[0] :   #test if we did not trigger the same error twice (because if so, we stop the game)
        response = "-7"
        game_on = False
        for packet in logs :
            print(packet,"\n")
    last_response = check

    return response
    

    


def client():
    global mybuffer
    global game_on
    global response_received
    global mycolor
    global op_color
    global myaicolor
    global op_aicolor
    global logs
    global last_response
    global connection


    logs = []
    last_response = [-1]
    mycolor = "W" # we (communication responsibles) deciced to attribute the color white to the client by default
    op_color = "B"
    myaicolor = Player.LIGHT
    op_aicolor = Player.DARK
    response_received = False
    connection = socket(AF_INET, SOCK_STREAM)
    try:
        connection.connect((host, serverPort))
    except ConnectionRefusedError:
        print("Server is not running or refusing connections.")
        return
    print("The client is connected to the server\n", flush=True)
    game_on = True

    validation =True
    while validation :
        start = input("Write \"START\" to initialize the board")
        if start == "START" :
            validation = False

    answer = "0"
    response_received = False
    connection.send(answer.encode()) #initialize the game
    timer_thread = threading.Thread(target=timer, daemon=True, args=(connection,)) #daemon here to ensure background programm exits when main exits
    timer_thread.start()

    while game_on:

        message = connection.recv(1024).decode()    #wait for a messsage from the opponent

        if message : # we received a response so we can stop the timer 
            response_received = True

        else :
            print("The server closed the connection")
            game_on = False

        logs.append(message)

        message = message.split("|") #need to "unpack" the data of the message
        answer = packet_processing(message) #process the message and create the answer
        logs.append(answer)
        global saved_rcv # save the message received in case we have process it again
        saved_rcv = message

        global last_message #make sure the message is saved outside the function
        last_message = answer   #update the last message
        response_received = False
        connection.send(answer.encode())    #send our answer to the opponent
        timer_thread = threading.Thread(target=timer, daemon=True, args=(connection,)) #daemon here to ensure background programm exits when main exits
        timer_thread.start()
    connection.close()
    print("The connection was closed")

try :    
    server()

except Exception as e :
    print(e)
    print("We issued an internal error and inform the opponent\n")
    answer = "-2"
    connection.send(answer.encode())
    print("The logs :\n")
    for packet in logs :
        print(packet,"\n")

finally :
    response_received = True #otherwise, the timer can still run
    connection.close()
    print("Connection closed")
