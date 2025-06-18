function delay(time){

  return new Promise((resolve)=>{

    if (skip || time == 0){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function bellman(){

  let newGrid = grid;
  let origins = [];
  // stores where the shortest path of some vertex/tile comes from

  for (let row = 0; row < 17; row++){

    let row_ = [];

    for (let col = 0; col < 17; col++){

      row_.push(-1);

      if (newGrid[row][col] != 0){

        newGrid[row][col] = -1;
      }

    }

    origins.push(row_);
  }

  setState(newGrid.slice());

  newGrid[start[0]][start[1]] = 0;

  let running = false;

  let previous = -1;

  return new Promise((done)=>{

  const mainInterval = setInterval(async () => {

    if (running || pause){

      return;
    }

    running = true;

    for (let row = 0; row < grid.length; row+=2){

      for (let col = 0; col < grid.length; col+=2){

        if (newGrid[row][col] == -1){
          // empty
          continue;
        }

        if (row-2 >= 0 && newGrid[row-1][col] != 0 && (newGrid[row-2][col] == -1 || newGrid[row-2][col] > newGrid[row][col] + 10)){

          // if ((row-2 != start[0] || col != start[1]) && (row-2 != end[0] || col != end[1])){

          newGrid[row-1][col] = newGrid[row][col] + 5;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row-2][col] = newGrid[row][col] + 10;
          // setState(newGrid.slice());
          newGrid = newGrid.slice();
          // }

          origins[row-2][col] = row * newGrid.length + col;
          setState(newGrid.slice());
          await delay(delayTime);
        }

        if (row+2 < newGrid.length && newGrid[row+1][col] != 0 && (newGrid[row+2][col] == -1 || newGrid[row+2][col] > newGrid[row][col] + 10)){

          // if ((row+2 != start[0] || col != start[1]) && (row+2 != end[0] || col != end[1])){

          newGrid[row+1][col] = newGrid[row][col] + 5;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row+2][col] = newGrid[row][col] + 10;
          // setState(newGrid.slice());
          newGrid = newGrid.slice();
          // }

          origins[row+2][col] = row * newGrid.length + col;
          setState(newGrid.slice());

          await delay(delayTime);
        }

        if (col-2 >= 0 && newGrid[row][col-1] != 0 && (newGrid[row][col-2] == -1 || newGrid[row][col-2] > newGrid[row][col] + 10)){

          // if ((row != start[0] || col-2 != start[1]) && (row != end[0] || col-2 != end[1])){

          newGrid[row][col-1] = newGrid[row][col] + 5;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row][col-2] = newGrid[row][col] + 10;
          // setState(newGrid.slice());
          newGrid = newGrid.slice();
          // }

          origins[row][col-2] = row * newGrid.length + col;
          setState(newGrid.slice());

          await delay(delayTime);
        }

        if (col+2 < newGrid.length && newGrid[row][col+1] != 0  && (newGrid[row][col+2] == -1 || newGrid[row][col+2] > newGrid[row][col] + 10)){

          // if ((row != start[0] || col+2 != start[1]) && (row != end[0] || col+2 != end[1])){

          newGrid[row][col+1] = newGrid[row][col] + 5;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row][col+2] = newGrid[row][col] + 10;
          // setState(newGrid.slice());
          newGrid = newGrid.slice();
          // }

          origins[row][col+2] = row * newGrid.length + col;
          setState(newGrid.slice());
          await delay(delayTime);
        }
      }
    }

    if (previous == newGrid){

      console.log(previous);
      console.log(newGrid);

      console.log("finish");

      let position = origins[end[0]][end[1]];
      let lastPosition = end[0] * newGrid.length + end[1];

      console.log(position);

      let debounce = false;

      const highlightPath = setInterval(async () => {

        if (debounce){

          return;
        }

        debounce = true;
        
        if (position == -1){

          console.log("highlighted path");

          newGrid[start[0]][start[1]] = -1;
          setState(newGrid.slice());

          clearInterval(highlightPath);
          done();
          return;
        }

        let difference;

        if (lastPosition - position > 0){

          difference = Math.floor((lastPosition - position) / 17);
        }
        else{

          difference = Math.ceil((lastPosition - position) / 17)
        }

        // console.log(Math.floor(position / newGrid.length), difference);
        // console.log(position % 17, ((lastPosition - position) % 17) / 2);

        newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
        setState(newGrid.slice());
        await delay(delayTime);

        newGrid[Math.floor(position / newGrid.length)][position % newGrid.length] = 2;
        setState(newGrid.slice());
        await delay(delayTime);


        lastPosition = position;
        position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

        debounce = false;

      }, 0);


      clearInterval(mainInterval);
      return;
    }

    previous = newGrid;

    running = false;

  }, 0);

  });

}