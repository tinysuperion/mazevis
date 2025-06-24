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

    return new Promise(async (resolve)=>{

      this.nodes[this.size] = value; // add it to the very end then bubble it to where it belongs
      this.size++;

      let index = this.size-1;
      let parent = Math.floor((index-1)/2);

      if (parent < 0){

        resolve();
        return;
      }

      while(parent >= 0 && this.nodes[parent][0] > value[0]){

        // keep swapping or as long as the parent is greater

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

function prims(row, col){

  let running = false;

  const newGrid = grid;
  const minHeap = new heap();

  return new Promise((done)=>{

  const mainInterval = setInterval(async ()=>{

    if (running || pause){

      return;
    }

    running = true;

    newGrid[row][col] = 1;
    setState(newGrid.slice());
    await delay(delayTime);

    if (row-2 >= 0 && newGrid[row-2][col] == 0){

      await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row-2, col]]]);
    }

    if (row+2 < grid.length && newGrid[row+2][col] == 0){

      await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row+2, col]]]);
    }

    if (col-2 >= 0 && newGrid[row][col-2] == 0){

      await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row, col-2]]]);
    }

    if (col+2 < grid.length && newGrid[row][col+2] == 0){

      await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row, col+2]]]);
    }

    const boundsCheck = new Promise((resolve)=>{

      let debounce = false;

      const validCheck = setInterval(async () => {

        if (debounce){

          return;
        }

        debounce = true;
        
        const minimum = minHeap.top();

        const origin = minimum[1][0];
        const destination = minimum[1][1];

        if (newGrid[destination[0]][destination[1]] == 0){

          clearInterval(validCheck);

          newGrid[origin[0] + (destination[0] - origin[0])/2][origin[1] + (destination[1] - origin[1])/2] = 1;
          setState(newGrid.slice());
          await delay(delayTime);

          row = destination[0];
          col = destination[1];

          resolve();
        }

        minHeap.pop();

        if (minHeap.size == 0){

          done();

          clearInterval(mainInterval);
          clearInterval(validCheck);

          resolve();
          return;
        }

        debounce = false;

      }, 0);

    },0);

    await boundsCheck;

    running = false;

  }, 0);

  })
}