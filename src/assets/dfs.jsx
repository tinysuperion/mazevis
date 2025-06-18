function delay(time){

	return new Promise((resolve)=>{

		if (skip || time == 0){

			resolve();
			return;
		}

		setTimeout(resolve, time);
	})

}  

function dfs(row, col){

	let running = false;

	let lastRow = -1;
	let lastCol = -1;

	let path = [];

	const newGrid = grid;

	return new Promise((done)=>{

	const mainInterval = setInterval(async ()=>{

		if (running || pause){

			return;
			// end iteration if still processing last iteration
		}

		running = true;

		let directionRow = 0;
		let directionCol = 0;

		newGrid[row][col] = 1;
		setState(newGrid.slice())

		await delay(delayTime);

		if (Math.round(Math.random()) < 1){

			directionRow = direction[Math.round(Math.random())];
		}
		else{

			directionCol = direction[Math.round(Math.random())];
		}

		// backtracking

		if (((row-2) < 0 || newGrid[row-2][col] >= 1) && ((row+2) >= newGrid.length || newGrid[row+2][col] >= 1) && (col-2 < 0 || newGrid[row][col-2] >= 1) && ((col+2) >= newGrid.length || newGrid[row][col+2] >= 1)){

			// dead end, backtrack, or more like go back through a queue, not using recursion even though it could do all this
			// simply due to how expensive it is which is why its one of the leading causes of a stack overflow

			let debounce = false;

			const backtrack = setInterval(async ()=>{

				if (debounce){

					return;
				}

				debounce = true;

				newGrid[row][col] = 2;
				setState(newGrid.slice());

				if (!(((row-2) < 0 || newGrid[row-2][col] >= 1) && ((row+2) >= newGrid.length || newGrid[row+2][col] >= 1) && ((col-2) < 0 || newGrid[row][col-2] >= 1) && ((col+2) >= newGrid.length || newGrid[row][col+2] >= 1))){

					clearInterval(backtrack);

					running = false;
					// next iteration will use the value it ended off at, no promise needed

					newGrid[lastRow + (row - lastRow)/2][lastCol + (col - lastCol)/2] = 2;
					setState(newGrid.slice());
					await delay(delayTime);

					newGrid[row][col] = 2;
					setState(newGrid.slice());
					await delay(delayTime);

					return;
				}


				if (path.length == 0){

					clearInterval(mainInterval);
					clearInterval(backtrack);

					done();

					return;
				}

				lastRow = row;
				lastCol = col;

				row = path[path.length-1][0];
				col = path[path.length-1][1];

				newGrid[lastRow + (row - lastRow)/2][lastCol + (col - lastCol)/2] = 2;
				setState(newGrid.slice());
				await delay(delayTime)

				newGrid[row][col] = 2;
				setState(newGrid.slice());
				await delay(delayTime);

				path.pop();

				debounce = false;

			}, 0);

			return;
		}
		
		// boundschecking

		if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] >= 1){

			let promise = new Promise(async (resolve)=>{
				
				let debounce = false;

				const boundsCheck = setInterval(async ()=>{

					if (debounce){

						return;
					}

					debounce = true;

					if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] >= 1)){

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

		newGrid[row + directionRow/2][col + directionCol/2] = 1;
		setState(newGrid.slice());

		await delay(delayTime);

		path.push([row, col]);

		row += directionRow;
		col += directionCol;

		running = false;

	}, 0);

	})

}