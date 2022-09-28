class HexGameState {
  constructor(hex_size, board, player) {
    this.hex_size = hex_size;
    this.board = board;  // a 2D array for the board.
    this.player = player;  // current player of the state (might not be MAX agent)
    this._winner = EMPTY;  // cache
    this._end = false;  // cache
    this._terminal_called = false;  // cache
  }

  static create_empty_state(hex_size) {
    // return the staring board of the game.
    // the board is a 2D array where i, j action is a position i, j on the board.
    let board = [];

    for (let i = 0; i < hex_size; i++) {
      let row = [];
      board.push(row);
      for (let j = 0; j < hex_size; j++) {
        row.push(EMPTY)
      }
    }
    return new HexGameState(hex_size, board, BLUE);

  }

  static togglePlayer(curPlayer) {
    if (curPlayer == RED) {
      curPlayer = BLUE;
    } else {
      curPlayer = RED;
    }
    return curPlayer;
  }

  actions() {
    // return a list of valid action (i, j).
    let valid_moves = [];
    for (let i = 0; i < this.hex_size; i++) {
      for (let j = 0; j < this.hex_size; j++) {
        if (this.board[i][j] == EMPTY) {
          valid_moves.push(new Action(i, j))
        }
      }
    }
    return valid_moves;
  }

  transition(action) {
    // place a piece of the current player on the board.
    // then, toggle the player.
    // If action is not valid, the turn will be skipped.
    let nextPlayer = HexGameState.togglePlayer(this.player);
    let newBoard = [];
    for (let i = 0; i < this.hex_size; i++) {
      newBoard.push(this.board[i].slice(0))
    }
    if (action && this.isValidAction(action.i, action.j)) {
      newBoard[action.i][action.j] = this.player;
    }
    return new HexGameState(this.hex_size, newBoard, nextPlayer);
  }


  isTerminal() {


    // build a disjoint set
    let blueDSU = new DSU();
    let redDSU = new DSU();
    for (let i = 0; i < this.hex_size; i++) {
      for (let j = 0; j < this.hex_size; j++) {
        let p = this.board[i][j];
        if (p == EMPTY) { continue; }
        for (let m = -1; m < 2; m++) {
          for (let n = -1; n < 2; n++) {
            if (m == n) { continue; }
            let u = i + m;
            let v = j + n;
            if (u < 0 || u >= this.hex_size || v < 0 || v >= this.hex_size) { continue; }
            if (p == this.board[u][v]) {
              if (p == RED) {
                redDSU.union(i + ',' + j, u + ',' + v);
              } else {
                blueDSU.union(i + ',' + j, u + ',' + v);
              }

            }
          }
        }
      }
    }

    for (let i = 0; i < this.hex_size; i++) {
      for (let u = 0; u < this.hex_size; u++) {
        // check if BLUE wins
        let subset1 = blueDSU.find(i + ',0');
        let subset2 = blueDSU.find(u + ',' + (this.hex_size - 1));
        // console.log([subset1, subset2])
        if (subset1 == subset2 && this.board[i][0] == BLUE) {
          this._winner = BLUE;
          break
        }
        // check if RED wins
        let subset3 = redDSU.find('0,' + i);
        let subset4 = redDSU.find((this.hex_size - 1) + ',' + u);

        if (subset3 == subset4 && this.board[0][i] == RED) {
          this._winner = RED;
          break
        }
      }
      if (this._winner != EMPTY) { break; }
    }
    if (this._winner == EMPTY) {
      // a long way to find whether the game has ended...
      this._terminal_called = true;
      let _c = 0;
      for (let i = 0; i < this.hex_size; i++) {
        for (let j = 0; j < this.hex_size; j++) {
          let p = this.board[i][j];
          if (p != EMPTY) { _c++; }
        }
      }
      if (_c == this.hex_size * this.hex_size) {
        this._end = true;
        return true;
      }
    }

    this._end = this._winner != EMPTY;
    return this._winner != EMPTY;
  }

  utility(query_player) {
    // Winner get 1.0 and the loser got -1.0
    if (!this._terminal_called) { this.isTerminal(); }
    if (this._winner == query_player) { return 1.0; }
    if (this._winner == EMPTY) { return 0.0; }
    return -1.0;
  }

  isValidAction(i, j) {
    // Check if the action i, j is valid
    return this.board[i][j] == EMPTY
  }


}

class Action {
  constructor(i, j) {
    this.i = i;
    this.j = j;
  }
}

