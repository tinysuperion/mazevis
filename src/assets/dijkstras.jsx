function delay(time){

  return new Promise((resolve)=>{

    if (skip || time == 0){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function dijkstras(){

  // basically a star except worse since theres no heuristic pruning
  // for some short path thats like a miles away

  // in fact i bet i can copy and paste the code and just delete a couple characters
  // and itd be dijkstras, cool

  let minHeap = new heap();
  // reminder, in this heap it expects an array, first index is the weight, anything afterwards
  // can be whatever, but the entire array is returned with top

  row = start[0];
  col = start[1];

  let current = [0, [row, col]]; // weight, [position, last position]
  minHeap.insert(current);

  const newGrid = grid;
  // let costs = [];
  let origins = [];

  for (let row = 0; row < 17; row++){

    let row_ = [];

    for (let col = 0; col < 17; col++){

      row_.push(-1);
      
      if (newGrid[row][col] != 0){
        // unitize
        newGrid[row][col] = -1;
      }

    }

    // costs.push(row_.slice());
    origins.push(row_.slice());
  }

  setState(newGrid.slice());

  let running = false;

  // NOTE 
  // theres no need to store g cost, just use costs since the cost is just the distance from the start now
  // tweak that later 

  return new Promise((done)=>{

  const mainInterval = setInterval(async () => {

    if (running || pause){

      return;
    }

    running = true;

    if (row == end[0] && col == end[1]){

      console.log("path finished");

      clearInterval(mainInterval);
      return;
    }

    let current = minHeap.top();
    minHeap.pop();

    if (current == -1){

      console.log("no path");

      clearInterval(mainInterval);
      return -1;
    }

    let destination = current[1];

    row = destination[0];
    col = destination[1];

    if ((row - 2) >= 0 && newGrid[row-1][col] != 0 && (row-2 != start[0] || col != start[1]) && (newGrid[row-2][col] == -1 || newGrid[row-2][col] > (current[0] + 10))){

      // the above checks if its in bounds and not the start, then if the value currently in this tile should be overwritten
      // which is if its currently empty or a more efficient path to it is available

      let cost = current[0] + 10;
      // costs[row-2][col] = cost;

      minHeap.insert([cost, [row-2, col]]);
      origins[row-2][col] = row * grid.length + col;

      newGrid[row - 1][col] = current[0] + 5;
      setState(newGrid.slice());
      await delay(delayTime);

      // console.log(current[2] + 1 + Math.abs(end[0] - (row - 1)) + Math.abs(end[1] - col));

      if (row-2 == end[0] && col == end[1]){

        console.log("path finished");

        clearInterval(mainInterval);

        let position = origins[end[0]][end[1]];
        let lastPosition = end[0] * newGrid.length + end[1];

        let debounce = false;

        const highlightPath = setInterval(async () => {

          if (debounce){

            return;
          }

          debounce = true;
          
          if (position == -1){

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

          newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
          // await delay(delayTime);

          debounce = false;

        }, 0);

        return;
      }

      newGrid[row-2][col] = cost;
      setState(newGrid.slice());
      await delay(delayTime);

    }

    if ((row + 2) < newGrid.length && grid[row+1][col] != 0 && (row+2 != start[0] || col != start[1]) &&  (newGrid[row+2][col] == -1 || newGrid[row+2][col] > (current[0] + 10))){

      let cost = current[0] + 10;
      // costs[row+2][col] = cost;

      minHeap.insert([cost, [row+2, col]]);
      origins[row+2][col] = row * grid.length + col;

      newGrid[row+1][col] = current[0] + 5;
      setState(newGrid.slice());
      await delay(delayTime);

      if (row+2 == end[0] && col == end[1]){

        console.log("path finished");

        clearInterval(mainInterval);

        let position = origins[end[0]][end[1]];
        let lastPosition = end[0] * newGrid.length + end[1];

        let debounce = false;

        const highlightPath = setInterval(async () => {

          if (debounce){

            return;
          }

          debounce = true;
          
          if (position == -1){

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

          newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          setState(newGrid.slice());

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
          // await delay(delayTime);

          debounce = false;

        }, 0);

        return;
      }

      newGrid[row+2][col] = cost;
      setState(newGrid.slice());
      await delay(delayTime);
    }

    if ((col - 2) >= 0 && grid[row][col-1] != 0 && (row != start[0] || col-2 != start[1]) &&  (newGrid[row][col-2] == -1 || newGrid[row][col-2] > (current[0] + 10))){

      let cost = current[0] + 10;
      // costs[row][col-2] = cost;

      minHeap.insert([cost, [row, col-2]]);
      origins[row][col-2] = row * grid.length + col;

      newGrid[row][col-1] =  current[0] + 5;
      setState(newGrid.slice());
      await delay(delayTime);

      if (row == end[0] && col-2 == end[1]){

        console.log("path finished");

        clearInterval(mainInterval);

        let position = origins[end[0]][end[1]];
        let lastPosition = end[0] * newGrid.length + end[1];

        let debounce = false;

        const highlightPath = setInterval(async () => {

          if (debounce){

            return;
          }

          debounce = true;
          
          if (position == -1){

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

          newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          setState(newGrid.slice());

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
          // await delay(delayTime);

          debounce = false;

        }, 0);

        return;
      }
    
      newGrid[row][col-2] = cost;
      setState(newGrid.slice());
      await delay(delayTime);
    }

    if ((col + 2) < newGrid.length && grid[row][col+1] != 0 &&(row != start[0] || col+2 != start[1]) &&  (newGrid[row][col+2] == -1 || newGrid[row][col+2] > (current[0] + 10))){

      let cost = current[0] + 10;
      // costs[row][col+2] = cost;

      minHeap.insert([cost, [row, col+2]]);
      origins[row][col+2] = row * grid.length + col;

      newGrid[row][col+1] = current[0] + 5;
      setState(newGrid.slice());
      await delay(delayTime);

      if (row == end[0] && col+2 == end[1]){

        console.log("path finished");

        clearInterval(mainInterval);

        let position = origins[end[0]][end[1]];
        let lastPosition = end[0] * newGrid.length + end[1];

        let debounce = false;

        const highlightPath = setInterval(async () => {

          if (debounce){

            return;
          }

          debounce = true;
          
          if (position == -1){

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

          newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]

          // if (position != -1){
          //   // meaning its not the last vertex or node, meaning its not the start
          //   newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          //   setState(newGrid.slice());
          // }

          // await delay(delayTime);

          debounce = false;

        }, 0);

        return;
      }

      newGrid[row][col+2] = cost;
      setState(newGrid.slice());
      await delay(delayTime);
    }

    running = false;

  }, 0);

  });

}