import Graph from 'graph.js';

export default steinerMinimalTree = (fullGraph, requiredVertices) => {

	/* symmetric closure of original graph */
	for (let [from, to, weight] of fullGraph.edges()) {
		fullGraph.spanEdge(to, from, weight);
	}

	/* bookkeeping */
	let searches       = [];
	let vertexToSearch = {};
	let steinerTree    = new Graph(requiredVertices.map(v=>[v]));
	for (let v of requiredVertices) {
		let search = {
			s: searches.length,
			graph: new Graph([[v]]),
			frontier: [v]
		};
		searches.push(search);
		vertexToSearch[v] = search;
	}

	/* bookkeeping manipulation functions */
	function addEdgeToSearch(from, to, search) {
		search.graph.createEdge(from, to);
		search.frontier.push(to);
		vertexToSearch[to] = search;
	}
	function mergeSearches(search1, search2) {
		search1.graph.mergeIn(search2.graph);
		let newFrontier = [];
		for (let i = 0; i < Math.min(search1.frontier.length, search2.frontier.length); ++i) {
			newFrontier.push(search1.shift());
			newFrontier.push(search2.shift());
		}
		newFrontier.push(...search1, ...search2);
		search1.frontier = newFrontier;
		search2.finished = true;
	}
	function recordConnection(v, search1, search2) {
		let v1 = v;
		do {
			steinerTree.createEdge(v1, search1.verticesTo(v1).next().value);
			v1 = search1.verticesTo(v1)[0];
		} while (!steinerTree.hasVertex(v1));
		let v2 = v;
		do {
			steinerTree.createEdge(v2, search2.verticesTo(v2).next().value);
			v2 = search1.verticesTo(v2)[0];
		} while (!steinerTree.hasVertex(v2));
	}

	/* the structure of the main loop */
	function* mainLoop() {
		while (searches.length > 1) {
			for (let search of searches) {
				if (!search.finished) {
					yield search;
				}
			}
			searches = searches.filter(s => !s.finished);
		}
	}

	/* the main loop */
	for (let search of mainLoop()) {
		let v = search.frontier.shift();
		for (let [vNext/*,,weight*/] of search.graph.verticesFrom(v)) {
			/* Did this search already reach this vertex? */
			if (search.graph.hasVertex(vNext)) { continue }

			/* Add this vertex to this search. */
			addEdgeToSearch(v, vNext, search);

			/* Did this search reach the frontier of another search? */
			for (let otherSearch of searches) {
				if (search === otherSearch) { continue }
				if (otherSearch.graph.hasVertex(vNext)) {
					mergeSearches(search, otherSearch);
					recordConnection(vNext, search, otherSearch);
				}
			}
		}
	}

	/* the steiner tree is finished */
	return steinerTree;
};
