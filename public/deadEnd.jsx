function delay(time){

  return new Promise((resolve)=>{

    if ((skip || time == 0) && !reset){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function deadEnd(row, col){

  let running = false;

  const newGrid = grid;

  let deadEnds = [];

  return new Promise(async (done)=>{

  await delay(delayTime); 
  // it ends up going fast enough that this occurs before the unitization occurs
  // so they end up being these blue tiles with no number in them, so theres a delay here

  for (let row = 0; row < newGrid.length; row+=2){

    for (let col = 0; col < newGrid.length; col+=2){

      let connections = 0;

      if (row-2 >= 0 && newGrid[row-1][col] == -1){

        connections++;
      }
        
      if (row+2 < newGrid.length && newGrid[row+1][col] == -1){


        connections++;
      }
      
      if(col-2 >= 0 && newGrid[row][col-1] == -1){

        connections++;
      }
      
      if(col+2 < newGrid.length && newGrid[row][col+1] == -1){

        connections++;
      }

      if (connections == 1){

        // dead-end, the only connection is the one leading into the dead-end

        if ((row != start[0] || col != start[1]) && (row != end[0] || col != end[1])){

          newGrid[row][col] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          deadEnds.push(row * newGrid.length + col);

        }
      }

    }

  }

  // i cant use a while loop or it freezes the site, and i cant set an interval as they could overlap
  // and cause unexpected behavior, which isnt exactly so unexpected the information they have just probably wont be accurate
  // instead ill just store the locations of dead-ends and go through them in the interval below

  row = Math.floor(deadEnds[0] / newGrid.length);
  col = deadEnds[0] % newGrid.length;

  const fill = setInterval(async ()=>{

    if (reset){

      clearInterval(fill);
      done()
      reset = false;
      return;
    }

    if (running || pause){

      return;
    }

    if (reset){

      clearInterval(mainInterval);
      done();
      reset = false;
      return;
    }

    running = true;

    let connections = 0;

    let directionRow = 0;
    let directionCol = 0;

    if ((row-2) >= 0 && newGrid[row-1][col] == -1){

      connections++;
      directionRow = -2;
    }
      
    if ((row+2) < newGrid.length && newGrid[row+1][col] == -1){

      connections++;
      directionRow = 2;
    }
    
    if(col-2 >= 0 && newGrid[row][col-1] == -1){

      connections++;
      directionCol = -2;
    }
    
    if((col+2) < newGrid.length && newGrid[row][col+1] == -1){

      connections++;
      directionCol = 2;
    }

    if (connections >= 2 || (row == start[0] && col == start[1] ) || (row == end[0] && col == end[1])){
      // reached a junction (excluding the connection youve gone through)
      // or if it reaches the start or end, if this occurs it obscures, takes over, or overrides the path
      // to the end so it stops at that scenario aswell

      // move onto the next deadend to fill

      console.log("found junction");

      deadEnds.shift();

      if (deadEnds.length == 0){

        clearInterval(fill);
        done();
        return;
      }

      row = Math.floor(deadEnds[0] / newGrid.length);
      col = deadEnds[0] % newGrid.length;

      running = false;

      return;
    }

    newGrid[row][col] = 2;
    setState(newGrid.slice());
    await delay(delayTime);

    newGrid[row + directionRow/2][col + directionCol/2] = 2;
    setState(newGrid.slice());
    await delay(delayTime)

    row += directionRow;
    col += directionCol;

    running = false;

  }, 0);

  });

}