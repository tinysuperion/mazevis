function delay(time){

  return new Promise((resolve)=>{

    if ((skip || time == 0) && !reset){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function bfs(row, col){

  let origins = [];

  const newGrid = grid;

  for (let row = 0; row < 17; row++){

    let row_ = [];

    for (let col = 0; col < 17; col++){

      row_.push(-1);

    }
    origins.push(row_.slice());
  }

  newGrid[row][col] = -2;
  setState(newGrid.slice());

  let queue = [];
  queue.push(row * newGrid.length + col);

  let running = false;

  return new Promise((done)=>{

    const mainInterval = setInterval(async () => {
      
      if (running || pause){

        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done()
        reset = false;
        return;
      }

      running = true;

      let position = queue[0];
      row = Math.floor(position / newGrid.length);
      col = position % newGrid.length;
      queue.shift();

      if (row == end[0] && col == end[1]){

        clearInterval(mainInterval);

        let position = origins[end[0]][end[1]];
        let lastPosition = end[0] * newGrid.length + end[1];

        let debounce = false;

        const highlightPath = setInterval(async () => {

          if (debounce){

            return;
          }

          if (reset){

            clearInterval(highlightPath);
            done()
            reset = false;
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

      }

      if (row-2 >= 0 && newGrid[row-1][col] != 0 && newGrid[row-2][col] != -2){

        newGrid[row-1][col] = -2;
        setState(newGrid.slice());
        await delay(delayTime);

        newGrid[row-2][col] = -2; // this difference in value just shows this tile has been since to cut off loops or redos
        origins[row-2][col] = position;
        queue.push(position - newGrid.length*2);
        setState(newGrid.slice());
        await delay(delayTime);
      }

      if (row+2 < newGrid.length && newGrid[row+1][col] != 0 && newGrid[row+2][col] != -2){

        newGrid[row+1][col] = -2;
        setState(newGrid.slice());
        await delay(delayTime);

        newGrid[row+2][col] = -2;
        origins[row+2][col] = position;
        queue.push(position + newGrid.length*2);
        setState(newGrid.slice());
        await delay(delayTime);
      }

      if (col-2 >= 0 && newGrid[row][col-1] != 0 && newGrid[row][col-2] != -2){

        newGrid[row][col-1] = -2;
        setState(newGrid.slice());
        await delay(delayTime);

        newGrid[row][col-2] = -2; 
        origins[row][col-2] = position;
        queue.push(position-2);
        setState(newGrid.slice());

        await delay(delayTime);
      }

      if (col+2 < newGrid.length && newGrid[row][col+1] != 0 && newGrid[row][col+2] != -2){

        newGrid[row][col+1] = -2;
        setState(newGrid.slice());
        await delay(delayTime);

        newGrid[row][col+2] = -2;
        origins[row][col+2] = position;
        queue.push(position+2);
        setState(newGrid.slice());

        await delay(delayTime);
      }

      running = false;

    }, 0);


  })

}