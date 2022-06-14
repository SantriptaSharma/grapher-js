<script lang="ts">
    import DisplayCanvas from "../DisplayCanvas.svelte";

    import type { Snapshot } from "../../stores/snapshot";
    import { Dijkstra } from "../../library/dijkstra";
import { Color } from "../../library/color";

    export let display : DisplayCanvas;

    let chromaticNumber : number = -1;
	let coloring : number[] = null;
    let preColor : Snapshot = null;

	let pathFrom : HTMLInputElement, pathTo : HTMLInputElement;
    
    function CalculateChromaticNumber()
	{
		const matrix = display.GetMatrix();
		if(matrix.length <= 1) 
		{
			chromaticNumber = matrix.length;
			coloring = matrix.length === 1 ? [0] : null;
		}
		
		coloring = new Array<number>(matrix.length).fill(-1);
		coloring[0] = 0;
		chromaticNumber = 1;
		preColor = null;

		const createColor = () => Math.max(...coloring) + 1;
		const neighbours = (a : number) => {
			const n = [];

			for(let i = 0; i < matrix[a].length; i++)
			{
				if(i === a) continue;
				if(matrix[a][i]) n.push(i);
			}

			return n;
		};

		for(let i = 1; i < matrix.length; i++)
		{
			let possibleColors = Array.from({length: createColor()}, (v, i) => i);

			const n = neighbours(i);
			n.forEach(neighbour => {
				possibleColors = possibleColors.filter((c) => c !== coloring[neighbour]);
			});

			if(possibleColors.length > 0)
			{
				coloring[i] = Math.min(...possibleColors);
			}
			else
			{
				coloring[i] = createColor();
				chromaticNumber += 1;
			}
		}
	}

	function ToggleColoring()
	{
		if(preColor === null)
		{
			let graph = display.Get();

			if(graph.verts.length === 0) return;

			if(coloring === null || coloring.length < graph.verts.length)
				CalculateChromaticNumber();

			preColor = display.Save("pre", false);

			// It would be extremely funny if two random colors intersect, waht are the odds?
			const colors = Array.from({length: Math.max(...coloring) + 1}, (v, i) => Color.RandomColor());

			for(let i = 0; i < graph.verts.length; i++)
			{
				graph.verts[i].color = colors[coloring[i]];
			}

			display.Set(graph.verts, graph.edges, false);
		}
		else
		{
            display.Load(preColor);
		}
	}

	export function InvalidateColoring()
	{
		chromaticNumber = -1;
		coloring = null;
		preColor = null;
	}

	function FindPath()
	{
		const from = pathFrom.value;
		const to = pathTo.value;

		const graph = display.Get();
		const matrix = display.GetMatrix();
		const vert_count = graph.verts.length;

		if(vert_count < 2)
		{
			alert("Not enough vertices to pathfind");
			return;
		}

		const isAlphabet = (c) => (c.charCodeAt(0) >= 'a'.charCodeAt(0) && c.charCodeAt(0) <= 'z'.charCodeAt(0)) || (c.charCodeAt(0) >= 'A'.charCodeAt(0) && c.charCodeAt(0) <= 'Z'.charCodeAt(0));

		if(!(Array.from(from).every(isAlphabet)))
		{
			alert("Invalid from argument, includes non-alphabetic characters");
			return;
		}

		if(!(Array.from(to).every(isAlphabet)))
		{
			alert("Invalid to argument, includes non-alphabetic characters");
			return;
		}

		const fromId = display.NameToId(from);
		const toId = display.NameToId(to);

		if(fromId === toId)
		{
			alert("From and To vertices cannot be the same");
			return;
		}

		if(fromId < 0 || fromId >= vert_count)
		{
			alert("From vertex does not exist");
			return;
		}

		if(toId < 0 || toId >= vert_count)
		{
			alert("To vertex does not exist");
			return;
		}

		graph.edges.forEach((v) => v.marked = false);

		const result = Dijkstra({ ...graph, matrix }, fromId, toId);

		if(result.success)
		{
			result.edges.forEach((v) => {
				graph.edges[v].marked = true;
			})
			display.Set(graph.verts, graph.edges);
		}
	}
</script>

<div id = "chromatic-holder">
    <div>Chromatic Number: {chromaticNumber < 0 ? "Unknown" : chromaticNumber }</div>
    <div id = "chromatic-actions">
        <button on:click = {CalculateChromaticNumber}>Recalculate</button>
        <button on:click = {ToggleColoring}>{preColor === null ? "Color" : "Reset Color"}</button>
    </div>
</div>
<div id = "pathfinding">
    <div>Shortest Path from <input type = "text" size = {5} bind:this = {pathFrom}/> to <input type = "text" size = {5} bind:this = {pathTo}/></div>
    <div>
        <button on:click = {FindPath}>Find Path</button>
    </div>
</div>

<style>

</style>