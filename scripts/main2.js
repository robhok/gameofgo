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
			this.group = [];
			this.dir = [{x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:1}];
            for (var i = 0; i < this.size; i++) {
                this.grid[i] = [];
                for (var j = 0; j < this.size; j++) {
                    this.grid[i][j] = 0;
					var div = document.createElement("div");
                    div.setAttribute('data-coord', i+"_"+j);
                    div.className = 'cell';
                    div.addEventListener('click', function(e) {
                        e.preventDefault;
                        var coord = this.getAttribute('data-coord').split("_");
                        self.play(parseInt(coord[0]), parseInt(coord[1]));
                    }, false);
                    this.plate.appendChild(div);
            	}
            }
            this.gog.appendChild(this.plate);
        },
        play: function(x, y) {
            if(this.grid[x][y] == 0 && this.grid[x][y] !== undefined) {
                this.grid[x][y] = {
					id:this.id,
					group: this.group.length
				}
				this.group.push({x:x,y:y});
				for (var i = 0; i < this.dir.length; i++) {
					var around = {
						x: x + this.dir[i].x,
						y: y + this.dir[i].y
					}
					if(this.grid[around.x][around.y] !== undefined && this.grid[around.x][around.y].id === this.id) {
						var newGroup = this.grid[around.x][around.y].group;
						var exGroup = this.grid[x][y].group;
						this.group[newGroup] = this.group[newGroup].concat(this.group[exGroup]);
						this.grid[exGroup] = 0;
						this.grid[x][y].group = this.grid[around.x][around.y].group;
					}
				}
				
			}
        },
        check: function(x, y, id) {
            var lib = 0;
            for (var i = 0; i < this.dir.length; i++) {
				var around = {
					x: x + this.dir[i].x,
					y: y + this.dir[i].y
				}
				if(this.grid[around.x][around.y] !== undefined && this.grid[around.x][around.y] === id) {
                    if (id === 0) {
                        if (this.check(around.x, around.y, this.id) === 1) lib++;
                    }
                    else lib++;
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
            this.id = parseInt((this.id%2) + 1);
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
