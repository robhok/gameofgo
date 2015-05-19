//(function () {
    function GoG() {};
    GoG.prototype = {
        init: function(id) {
            var self = this;
            this.gog = document.getElementById("gog");
            this.size = 19;
            this.plate = document.createElement("div");
			this.plate.className = 'play';
            this.grid = [];
            this.id = parseInt(id);
			this.pass = 0;
			this.dir = [{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:1}];
            for (var j = 0; j < this.size; j++) {
                this.grid[j] = [];
                for (var i = 0; i < this.size; i++) {
                    this.grid[j][i] = 0;
					var div = document.createElement("div");
                    div.setAttribute('data-coord', i+"_"+j);
                    div.className = 'cell';
                    div.addEventListener('click', function(e) {
                        e.preventDefault;
                        var coord = this.getAttribute('data-coord').split("_");
                        self.play(coord[0], coord[1]);
                    }, false);
                    this.plate.appendChild(div);
            	}
            }
            this.gog.appendChild(this.plate);
        },
        play: function(x, y) {
            if(this.grid[x][y]==0) {
				this.checked = [];
				this.grid[x][y] = this.id;
				var cell = document.querySelector('.cell[data-coord="'+x+'_'+y+'"]');
				if (this.id == 1) cell.classList.add('black');
				else cell.classList.add('white');
				for (var i = 0; i < this.dir.length; i++) {
					var around = {
						x: parseInt(x) + this.dir[i].x,
						y: parseInt(y) + this.dir[i].y
					}
					if (around.x < this.size && around.y < this.size && around.y > -1 && around.x > -1 && (this.grid[around.x][around.y] == (this.id%2) + 1) ) {
						if (this.grid[around.x][around.y] == (this.id%2) + 1) {
							this.checked.push(around);
							if (this.check(around.x, around.y) == 0) this.kill(this.grid, this.checked);
							else this.uncheck(this.grid, this.checked);
						}
					}
				}
				this.changeRound();
				this.pass = 0;
			}
        },
        check: function(x, y) {
            var lib = 0;
            for (var i = 0; i < this.dir.length; i++) {
				var around = {
						x: parseInt(x) + this.dir[i].x,
						y: parseInt(y) + this.dir[i].y
				}
				if (around.x < this.size && around.y < this.size && around.y > -1 && around.x > -1 && (this.grid[around.x][around.y] == 0) ) {
					lib++;
				}
            }
            for (var i = 0; i < this.dir.length; i++) {
				var around = {
					x: parseInt(x) + this.dir[i].x,
					y: parseInt(y) + this.dir[i].y
				}
				if (around.x < this.size && around.y < this.size && around.y > -1 && around.x > -1 && (this.grid[around.x][around.y] == (this.id%2) + 1)) {
					this.grid[around.x][around.y] += 0.5;
                    this.checked.push(around);
					lib += this.check(around.x, around.y);
                }
            }
            return lib;
        },
        uncheck: function (grid, array) {
            for (var i = 0; i < array.length; i++) {
                grid[array[i].x][array[i].y] = parseInt(grid[array[i].x][array[i].y]);
            }
        },
        kill: function (grid, array) {
            for (var i = 0; i < array.length; i++) {
                grid[array[i].x][array[i].y] = 0;
                var cell = document.querySelector('.cell[data-coord="'+array[i].x+'_'+array[i].y+'"]');
                if (cell.classList.contains('white')) cell.classList.remove('white');
                else if (cell.classList.contains('black')) cell.classList.remove('black');
            }
        },
        changeRound : function() {
            this.id = (this.id%2) + 1;
        },
        pass: function() {
            this.changeRound();
        },
        end: function() {
            return;
        }
    }
//}) ();
    
    var gog = new GoG();
    gog.init(1);
