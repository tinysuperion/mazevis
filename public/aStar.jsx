function delay(time){

  return new Promise((resolve)=>{

    if ((skip || time == 0) && !reset){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

class heap{

  constructor(){

    this.nodes = [];
    this.size = 0;
  }

  // to get a child at some index its just
  // nodes[2 * parentIndex + {1 or 2 for left or right child}] 

  top(){

    if (this.size < 1){

      return -1;
    }

    return this.nodes[0];
  }

  insert(value){

    // function for bubble sort basically

    // change it later so that value is an array
    // with the weight and another array containing a position

    // console.log("insert", value);

    return new Promise(async (resolve)=>{

      // await this.scale();

      this.nodes[this.size] = value; // add it to the very end then bubble it to where it belongs
      this.size++;

      let index = this.size-1;
      let parent = Math.floor((index-1)/2);

      // console.log(this.nodes, parent);

      // console.log("parent", this.nodes[parent], "top", this.top());

      if (parent < 0){

        resolve();
        return;
      }

      while(parent >= 0 && this.nodes[parent][0] > value[0]){

        // keep swapping or as long as the parent is greater

        // console.log(`swap ${this.nodes[parent][0]} and ${value[0]}`);

        const storage = this.nodes[parent];

        this.nodes[parent] = value;
        this.nodes[index] = storage;

        index = parent;
        parent = Math.floor((index-1)/2);
      }

      resolve();
    })

  }

  pop(){

    if (this.size == 0){

      return -1;
    }

    else if (this.size == 1){
      
      this.nodes[0] = null;
    }

    let index = 0;

    this.nodes[0] = this.nodes[this.size-1]; 
    // doesnt necessarily have to be the last node, it just has to be a leaf node to make rearrangements a lot easier
    this.size--;

    while (index*2+1 < this.size){
      // index*2+1 represents the left child

      let minChild;

      // get the smaller child to compare the current value against

      if (index*2+2 >= this.size || this.nodes[index*2+1][0] < this.nodes[index*2+2][0]){

        minChild = index*2+1;
      }
      else{

        minChild = index*2+2;
      }

      if (this.nodes[index][0] < this.nodes[minChild][0]){

        break;
      }

      else{

        const storage = this.nodes[index];
        
        this.nodes[index] = this.nodes[minChild];
        this.nodes[minChild] = storage;
      }

      index = minChild;

    }

    return 1;

  }
}

function aStar(row, col){

  // a star is basically
  // get the values of all the nodes surrounding some node
  // this value is made up of the g and h cost, g is distance from start, h is
  // distance from end, together they represent the distance travelled and distance left to go
  // then select the node with the smallest value and continue until you make it to the end
  // im gonna laze though since ive got all week all to myself since clovers on vacation so
  // im sort of crazy

  // calculating weight of neighbors

  let minHeap = new heap();
  // reminder, in this heap it expects an array, first index is the weight, anything afterwards
  // can be whatever, but the entire array is returned with top

  row = start[0];
  col = start[1];

  let current = [0, [row, col], 0]; // weight, [position, last position], g cost (its like this
  // so i dont have to change the current heap implementation that prims uses, h cost is just calculated easily by difference)
  minHeap.insert(current);

  const newGrid = grid;
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

    origins.push(row_.slice());
  }

  setState(newGrid.slice());

  let running = false;

  return new Promise((done)=>{

  const mainInterval = setInterval(async () => {

    if (running || pause){

      return;
    }

    running = true;

    let current = minHeap.top();
    minHeap.pop();

    if (current == -1){

      clearInterval(mainInterval);
      return -1;
    }

    let destination = current[1];
    // let origin = current[1][1];

    row = destination[0];
    col = destination[1];

    if ((row - 2) >= 0 && grid[row-1][col] != 0 && ((row-2) != start[0] || col != start[1]) && (newGrid[row-2][col] == -1 || newGrid[row-2][col] > (current[2] + 10 + Math.abs(end[0] - (row - 2)) * 5 + Math.abs(end[1] - col) * 5))){

      // the above checks if its in bounds and not the start, then if the value currently in this tile should be overwritten
      // which is if its currently empty or a more efficient path to it is available

      // let cost = Math.abs(start[0] - (row - 2)) + Math.abs(start[1] - col) + Math.abs(end[0] - (row - 2)) + Math.abs(end[1] - col);
      let cost = current[2] + 10 + Math.abs(end[0] - (row - 2)) * 5 + Math.abs(end[1] - col) * 5;

      minHeap.insert([cost, [row-2, col], current[2]+10]);
      origins[row-2][col] = row * grid.length + col;

      newGrid[row - 1][col] = current[2] + 5 + Math.abs(end[0] - (row - 1)) * 5 + Math.abs(end[1] - col) * 5;
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

        return;
      }

      newGrid[row-2][col] = cost;
      setState(newGrid.slice());
      await delay(delayTime);

    }

    if ((row + 2) < newGrid.length && grid[row+1][col] != 0 && ((row+2) != start[0] || col != start[1]) &&  (newGrid[row+2][col] == -1 || newGrid[row+2][col] > (current[2] + 10 + Math.abs(end[0] - (row + 2)) * 5 + Math.abs(end[1] - col) * 5))){

      // let cost = Math.abs(start[0] - (row + 2)) + Math.abs(start[1] - col) + Math.abs(end[0] - (row + 2)) + Math.abs(end[1] - col);

      let cost = current[2] + 10 + Math.abs(end[0] - (row + 2)) * 5 + Math.abs(end[1] - col) * 5;
      // costs[row+2][col] = cost;

      minHeap.insert([cost, [row+2, col], current[2]+10]);
      origins[row+2][col] = row * grid.length + col;

      newGrid[row+1][col] = current[2] + 5 + Math.abs(end[0] - (row + 1)) * 5 + Math.abs(end[1] - col) * 5;
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

          console.log(Math.floor(position / newGrid.length), difference);
          console.log(position % 17, ((lastPosition - position) % 17) / 2);

          newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]

          debounce = false;

        }, 0);

        return;
      }

      newGrid[row+2][col] = cost;
      setState(newGrid.slice());
      await delay(delayTime);
    }

    if ((col - 2) >= 0 && grid[row][col-1] != 0 && (row != start[0] || (col-2) != start[1]) &&  (newGrid[row][col-2] == -1 || newGrid[row][col-2] > (current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 2)) * 5))){

      // let cost = Math.abs(start[0] - row) + Math.abs(start[1] - (col - 2)) + Math.abs(end[0] - row) + Math.abs(end[1] - (col - 2));

      let cost = current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 2)) * 5;
      // costs[row][col-2] = cost;

      minHeap.insert([cost, [row, col-2], current[2]+10]);
      origins[row][col-2] = row * grid.length + col;

      newGrid[row][col-1] =  current[2] + 5 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 1)) * 5;
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

          // console.log(Math.floor(position / newGrid.length), difference);
          // console.log(position % 17, ((lastPosition - position) % 17) / 2);

          newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

          debounce = false;

        }, 0);

        return;
      }
    
      newGrid[row][col-2] = cost;
      setState(newGrid.slice());
      await delay(delayTime);
    }

    if ((col + 2) < newGrid.length && grid[row][col+1] != 0 && (row != start[0] || (col+2) != start[1]) &&  (newGrid[row][col+2] == -1 || newGrid[row][col+2] > (current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] -(col + 2)) * 5))){

      // let cost = Math.abs(start[0] - row) + Math.abs(start[1] - (col + 2)) + Math.abs(end[0] - row) + Math.abs(end[1] - (col + 2));
      let cost = current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col + 2)) * 5;
      // costs[row][col+2] = cost;

      minHeap.insert([cost, [row, col+2], current[2]+10]);
      origins[row][col+2] = row * grid.length + col;

      newGrid[row][col+1] = current[2] + 5 + Math.abs(end[0] - row) * 5+ Math.abs(end[1] - (col + 1)) * 5;
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

          // console.log(Math.floor(position / newGrid.length), difference);
          // console.log(position % 17, ((lastPosition - position) % 17) / 2);

          newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

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