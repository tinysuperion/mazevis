function delay(time){

  return new Promise((resolve)=>{

    if (skip || time == 0){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function AldousBroder(row, col){

  let available = [];

  for (let row = 0; row < 17; row+=2){

    for (let col = 0; col < 17; col+=2){

      available.push(row*17 + col);
    }
  }

  const newGrid = grid;

  let lastRow = -1;
  let lastCol = -1;

  let running = false;

  return new Promise((done)=>{

  const mainInterval = setInterval(async ()=>{

    if (running == true){

      return;
      // end iteration if still processing last iteration
    }

    running = true;

    let directionRow = 0;
    let directionCol = 0;


    newGrid[row][col] = 2;
    setState(newGrid.slice());

    if (lastRow != -1){

      newGrid[lastRow][lastCol] = 1;
      setState(newGrid.slice());
    }

    await delay(delayTime);

    if (available.indexOf(row*17 + col) != -1){

      available.splice(available.indexOf(row*17 + col),1);
    }

    if (available.length == 0){

      newGrid[row][col] = 1;
      setState(newGrid.slice());

      clearInterval(mainInterval);
      done();
      return;
    }

    if (Math.round(Math.random()) < 1){

      directionRow = direction[Math.round(Math.random())];
    }
    else{

      directionCol = direction[Math.round(Math.random())];
    }

    // boundschecking

    if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length){

      let promise = new Promise(async (resolve)=>{

        let debounce = false;

        const boundsCheck = setInterval(async ()=>{

          if (debounce == true){

            return;
          }

          debounce = true;

          if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length)){

            clearInterval(boundsCheck);

            resolve();

            return;
          }

          if (Math.round(Math.random()) < 1){
  
            directionRow = direction[Math.round(Math.random())];
            directionCol = 0;
          }
          else{
      
            directionCol = direction[Math.round(Math.random())];
            directionRow = 0;
          }

          debounce = false;

        },0);

      })

      await promise;
    }

    if (!(newGrid[row + directionRow][col + directionCol] == 1 && newGrid[row + (directionRow/2)][col + (directionCol/2)] != 1)){

      newGrid[row + directionRow/2][col + directionCol/2] = 1;
      setState(newGrid.slice());
    }

    await delay(delayTime);

    lastRow = row;
    lastCol = col;

    row += directionRow;
    col += directionCol;

    running = false;

  }, 0);

  })

}
