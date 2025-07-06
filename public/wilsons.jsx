function delay(time){

  return new Promise((resolve)=>{

    if ((skip || time == 0) && !reset){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function wilsons(row, col){

  const newGrid = grid;

  let cells = [];

  for (let row = 0; row < 17; row+=2){

    for (let col = 0; col < 17; col+=2){

      cells.push(row * 17 + col);
    }
  }

  let count = 3;

  let index = Math.round(Math.random() * (cells.length-1));

  row = Math.floor(cells[index] / 17);
  col = cells[index] % 17; 

  newGrid[row][col] = 1;
  setState(newGrid.slice());

  cells.splice(cells.indexOf(row * 17 + col), 1);

  index = Math.round(Math.random() * (cells.length-1));

  row = Math.floor(cells[index] / 17);
  col = cells[index] % 17; 

  let path = [];

  let running = false;

  return new Promise((done)=>{

  const mainInterval = setInterval(async ()=>{

    if (running || pause){

      return;
    }

    if (cells.length == 0){

      clearInterval(mainInterval);
      done();
      return;
    }

    running = true;

    let directionRow = 0;
    let directionCol = 0;

    newGrid[row][col] = count;
    setState(newGrid.slice());
    await delay(delayTime);


    cells.splice(cells.indexOf(row * 17 + col), 1);

    path.push(row * 17 + col);

    if (Math.round(Math.random()) < 1){

      directionRow = direction[Math.round(Math.random())];
    }
    else{

      directionCol = direction[Math.round(Math.random())];
    }

    if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] >= 1){

      let promise = new Promise(async (resolve)=>{

        let debounce = false;

        const boundsCheck = setInterval(async ()=>{

          // 3 checks here, check if this path starts a loop, check if it intersects another tile, and
          // generally check if where the path is going is in bounds

          if (debounce == true){

            return;
          }


          if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length ||newGrid[row + directionRow][col + directionCol] == 0 || newGrid[row + directionRow][col + directionCol] != count) && newGrid[row + directionRow/2][col + directionCol/2] == 0){

            // this is the case where a loop is formed (when the value at this position is count)
            // this gets rid of the loop by starting where the loop was formed

            debounce = true;

            let lastRow = Math.floor(path[path.length-1] / 17);
            let lastCol = path[path.length-1] % 17;

            let row_;
            let col_;

            const promise = new Promise(async (resolve)=>{

              // i could instead repurpose row instead of making a new variable but given
              // their different uses i think its easier to see doing this, besides i wouldnt have to
              // then make 2 variables for the intersection or just one array

              let debounce = false;

              const eraseLoop = setInterval(async () => {

                if (debounce){

                  return;
                }

                debounce = true;

                row_ = Math.floor(path[path.length-1] / 17);
                col_ = path[path.length-1] % 17;

                if (row_ != row + directionRow || col_ != col + directionCol){
                  
                  console.log(row_, col_);

                  console.log(newGrid[row_][col_]);

                  newGrid[row_ + (lastRow - row_)/2][col_ + (lastCol - col_)/2] = 0;
                  setState(newGrid.slice());
                  await delay(delayTime);

                  newGrid[row_][col_] = 0;
                  setState(newGrid.slice());
                  await delay(delayTime);

                  cells.push(row_ * 17 + col_);

                  lastRow = row_;
                  lastCol = col_;

                  path.pop();

                  debounce = false;

                  return;
                }

                newGrid[row_ + (lastRow - row_)/2][col_ + (lastCol - col_)/2] = 0;
                setState(newGrid.slice());

                clearInterval(eraseLoop);
                resolve();

              }, 0);

            })

            await promise;

            row = row_;
            col = col_;

            debounce = false;

            return;
          }

          if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length ||newGrid[row + directionRow][col + directionCol] == 0 || newGrid[row + directionRow][col + directionCol] == count)){

            path = [];

            newGrid[row + directionRow/2][col + directionCol/2] = 1; // 1 is just an arbitrary value, doesnt matter
            setState(newGrid.slice());

            if (cells.length == 0){

              clearInterval(mainInterval);
              clearInterval(boundsCheck);

              done();

              return;
            }

            const index = Math.round(Math.random() * (cells.length-1));

            row = Math.floor(cells[index] / 17);
            col = cells[index] % 17;

            cells.splice(index, 1);
            path.push(row * 17 + col);

            count++;

            newGrid[row][col] = count;
            setState(newGrid.slice());
          }

          if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] != 0)){

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

        },0);
      })

      await promise;
    }

    newGrid[row + directionRow/2][col + directionCol/2] = count;
    setState(newGrid.slice());
    await delay(delayTime);

    row += directionRow;
    col += directionCol;

    running = false;

  },0);

  });

}