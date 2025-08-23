function delay(time){

  return new Promise((resolve)=>{

    if ((skip || time == 0) && !reset){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function kruskals(row, col){

  const newGrid = grid;

  let walls = [];
  let trees = new Map;

  for (let row = 0; row < 17; row+=2){

    for (let col = 0; col < 17; col+=2){

      if (row != 16){

        walls.push([[row, col], [row+2, col]]);
      }

      if (col != 16){

        walls.push([[row, col], [row, col+2]]);
      }

    }
  }

  setState(newGrid.slice());

  let running = false;

  let treeID = -1;
  // basically its an id for what tree a tile belongs to, this value is saved in the grid

  return new Promise((done)=>{

  const mainInterval = setInterval(async ()=>{

    if (walls.length == 0){

      clearInterval(mainInterval);
      done();
      return;
    }

    if (running || pause){
      
      return;
    }

    running = true;

    let index = Math.floor(Math.random() * (walls.length-1))

    let wall = walls[index];
    row = wall[0][0];
    col = wall[0][1];

    walls.splice(index, 1);

    let destinationRow = wall[1][0];
    let destinationCol = wall[1][1];

    // check for connection

    if (newGrid[row][col] < 0){
      // if a wall/tree already exists at this position nothing needs to be done sincee its already apart of it
      // im not sure if this is best practice but it works and its not hard to look at
    }

    else if (row-2 >= 0 && newGrid[row-1][col] < 0){

      newGrid[row][col] = newGrid[row-2][col];

      let copy = trees.get(newGrid[row-2][col]);

      copy.push(row * 17 + col);

      trees.set(newGrid[row][col], copy);
    }

    else if (row+2 < 17 && newGrid[row+1][col] < 0){

      newGrid[row][col] = newGrid[row+2][col];

      let copy = trees.get(newGrid[row+2][col]);

      copy.push(row * 17 + col);

      trees.set(newGrid[row][col], copy);
    }

    else if (col-2 >= 0 && newGrid[row][col-1] < 0){

      newGrid[row][col] = newGrid[row][col-2];

      let copy = trees.get(newGrid[row][col-2]);

      copy.push(row * 17 + col);

      trees.set(newGrid[row][col], copy);
    }

    else if (col+2 >= 0 && newGrid[row][col+1] < 0){

      newGrid[row][col] = newGrid[row][col+2];

      let copy = trees.get(newGrid[row][col+2]);

      copy.push(row * 17 + col);

      trees.set(newGrid[row][col], copy);
    }

    else{

      newGrid[row][col] = treeID;
      trees.set(treeID, [row * 17 + col]);

      console.log(trees.get(treeID), treeID);

      treeID--;
    }

    setState(newGrid.slice());

    await delay(delayTime);

    if (newGrid[row][col] == newGrid[destinationRow][destinationCol]){
      // choose a new wall
      running = false;
      return;
    }

    if (newGrid[destinationRow][destinationCol] != 0){

      // combine the 2 trees

      let tree = trees.get(newGrid[row][col]);
      const id = newGrid[row][col];

      console.log(tree);

      newGrid[row + (destinationRow - row)/2][col + (destinationCol - col)/2] = newGrid[destinationRow][destinationCol];

      let copy = trees.get(newGrid[destinationRow][destinationCol]);
      console.log(destinationRow, destinationCol, copy);

      for (const position of tree){

        const row_ = Math.floor(position / 17);
        const col_ = position % 17;

        console.log(position, row_, col_, row, col);

        newGrid[row_][col_] = newGrid[destinationRow][destinationCol];

        copy.push(position);
      }

      trees.set(newGrid[destinationRow][destinationCol], copy);
      trees.delete(id);

      setState(newGrid.slice());

      await delay(delayTime); 
    }
    else{

      let copy = trees.get(newGrid[row][col]);
      copy.push(destinationRow * 17 + destinationCol);
      trees.set(newGrid[row][col], copy);

      newGrid[row + (destinationRow - row)/2][col + (destinationCol - col)/2] = newGrid[row][col];
      setState(newGrid.slice());

      await delay(delayTime);

      newGrid[destinationRow][destinationCol] = newGrid[row][col];
      setState(newGrid.slice());

      await delay(delayTime);
    }

    running = false;

  },0)

  })

}