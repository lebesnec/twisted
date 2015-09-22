var Nodes = {

    getDataNodes : function (dataTiles) {
        var me = this,
            nbNodesRow = Math.ceil(Math.sqrt((NB_NODES * dataTiles.nbCol) / dataTiles.nbRow)),
            nbNodesCol = Math.ceil(NB_NODES / nbNodesRow),
            nb = 0,
            data = [];
        
        for (var i = 0; i < nbNodesCol; i++) {
            for (var j = 0; j < nbNodesRow; j++) {
                if (nb < NB_NODES) {
                    nb++;
                    var tile = me.getTileAt(dataTiles.data, i, j);
                    data.push({
                        id : "node_" + i + "_" + j,
                        x : tile.x,
                        y : tile.y,
                        tile : tile
                    });
                }
            }
        }

        return data;
    },
    
    getTileAt : function (tiles, row, col) {
        var result = null;
        
        for (var i = 0; i < tiles.length; i++) {
            var tile = tiles[i];
            if (tile.row == row && tile.col == col) {
                result = tile;
                break;
            }
        };
        
        return result;
    },

    renderNodes : function (svg, data, tiles, links) {
        var drag = d3.behavior.drag()
            .on("drag", function (n) {
                var nearestTile = Nodes.getNearestAvailableTile(n, d3.event.x, d3.event.y, tiles);
                n.x = nearestTile.x;
                n.y = nearestTile.y;                
              
                d3.select(this)
                    .attr("cx", n.x)
                    .attr("cy", n.y)
                    .attr("r", 20)
                    .attr("class", "draggedNode");
                links.each(function (l) {
                    if (l.source === n) {
                       d3.select(this)
                           .attr("x1", n.x)
                           .attr("y1", n.y);
                    } else if (l.target === n) {
                       d3.select(this)
                           .attr("x2", n.x)
                           .attr("y2", n.y);
                    }
                });
            })
            .on("dragend", function (n) {
                d3.select(this)
                    .attr("r", 10)
                    .attr("class", "node");
            });

        var nodes = svg.selectAll("node").data(data.nodes, function (n) {
            return n.id;
        });

        nodes.exit()
            .transition()
                .attr("r", 0)
            .remove();

        nodes.enter()
            .append("circle")
                .attr("r", 0)
                .attr("class", "node")
                .call(drag)
            .transition()
                .attr("r", 10);

        nodes
            .attr("cx", function (n) {
                return n.x;
            })
            .attr("cy", function (n) {
                return n.y;
            });

        return nodes;
    },
    
    getNearestAvailableTile  : function (node, x, y, tiles) {
        var minDistance = 999999,
            nearestTile = null;
        
        tiles.each(function (tile) {
            // ignore tiles with a node, except if it's the node currently dragged :
            if (tile.node == null || tile.node == node) {
                var lx = tile.x - x,
                    ly = tile.y - y,
                    distance = Math.sqrt((lx * lx) + (ly * ly));

                if (minDistance > distance) {
                    minDistance = distance;
                    nearestTile = tile;
                }
            }
        });
        
        // not working after a drop :( TODO
        /*nearestTile.node = node;
        if (node.tile != null) {
            if (node.tile.node != node) {
                node.tile.node = null;
            }            
        }*/
        
        // clean the previous tile of the node being dragged :
        if (node.tile != null) {
            node.tile.node = null;
        }
        // set the tile and node :
        node.tile = nearestTile;
        node.tile.node = node;
        
        return nearestTile;
    }

};