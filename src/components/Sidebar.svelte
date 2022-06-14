<script type="ts">
    import { createEventDispatcher } from 'svelte';

    import GridCanvas from "./GridCanvas.svelte";
    import DisplayCanvas from "./DisplayCanvas.svelte";
	import Foldup from './ui/Foldup.svelte';
	import SnapshotDisplay from './ui/SnapshotDisplay.svelte';
    import { GraphEdge, GraphVertex } from "../library/graphelement";
    import { Color } from "../library/color";
	import { Point } from '../library/point';
	import { ClampValue, ImportPlacer } from '../library/helpers';
	import { Dijkstra } from "../library/dijkstra";
    
    import FaTrash from 'svelte-icons/fa/FaTrash.svelte';
	import { snapshots, type Snapshot } from '../stores/snapshot';

	import { FibonacciHeap } from "@tyriar/fibonacci-heap";

	export let gridCanvas : GridCanvas;
    export let display : DisplayCanvas;
    export let selected : GraphVertex;

    let open : boolean = true;
    let colorInput : HTMLInputElement;
	let xInput : HTMLInputElement, yInput : HTMLInputElement;
	let radiusInput : HTMLInputElement;
	let matrixString : string = "";
    let color : string = "#000000";
	let radius : number = 0; 
	let position : Point = Point.Zero;
	let snapName : string = "";
	let foldups : boolean[] = [false, false, false, false];
	let chromaticNumber : number = -1;
	let coloring : number[] = null;
	let preColor : Snapshot = null;

	let pathFrom : HTMLInputElement, pathTo : HTMLInputElement;

    const helpDispatcher = createEventDispatcher();

    function OnColorChange()
	{
		if(selected === null) return;

		color = colorInput.value;
		let targetColor = new Color(colorInput.value);
		selected.color = targetColor;
		display.Dirty();
	}

	function OnPositionChange()
	{
		if(selected === null) return;

		let xAsFloat = parseFloat(xInput.value);
		let yAsFloat = parseFloat(yInput.value);

		if(xAsFloat === NaN || yAsFloat === NaN) return;

		xAsFloat = ClampValue(xAsFloat, -15, 15);
		yAsFloat = ClampValue(yAsFloat, -15, 15);

		position = {x: xAsFloat, y: yAsFloat};

		selected.pos = position;
		selected.RecalculateExtents();
		display.Dirty();
	}

	function OnRadiusChange()
	{
		if(selected === null) return;
		
		let radiusAsFloat = parseFloat(radiusInput.value);
		
		if(radiusAsFloat === NaN) return;

		radiusAsFloat = ClampValue(radiusAsFloat, 0.12, 12);
		radius = radiusAsFloat;
		selected.radius = radius;
		selected.RecalculateExtents();
		display.Dirty();
	}

	function FoldupToggled(ev : any)
	{
		let ind = ev.detail;
		if(typeof ind !== "number") return;

		if(ind === undefined) return;
		
		foldups[ind] = !foldups[ind];
	}

	function Import()
	{
		let lines : String[] = matrixString.split("\n").filter(s => s.trim() !== "");
		let size = lines.length;
		if(size === 0 || size === 1) return;

		let matrix : boolean[][] = new Array(size);
		for(let i = 0; i < size; i++)
		{
			let n = new Array(size);
			matrix[i] = n.fill(false);
		}

		const chars = ['0', '1'];

		for(let i = 0; i < size; i++)
		{
			let l = lines[i].replaceAll(" ", "");

			if(l.length !== size)
			{
				alert(`Invalid Adjacency Matrix: Matrix is not square.\n(Height = ${size}, Row ${i+1} Length = ${l.length}).`);
				return;
			}

			for(let j = i+1; j < size; j++)
			{
				let ch = l[j];

				if(chars.indexOf(ch) === -1)
				{
					alert(`Invalid Adjacency Matrix: Matrix contains non-boolean (not 0 or 1) value.`);
					return;
				}

				let connected = ch === "1";
				matrix[i][j] = connected;
				matrix[j][i] = connected;
			}
		}

		let degree = matrix.map((v, i) => ({ind: i, d: v.reduce<number>((d, adj) => adj ? d + 1 : d, 0)})).sort((a,b) => b.d - a.d);

		let verts : GraphVertex[] = ImportPlacer(matrix, degree);
		let edges : GraphEdge[] = [];

		for(let i = 0; i < size; i++)
		{
			matrix[i].map((v, j) =>{
				if(j > i && v)
				{
					edges.push(new GraphEdge(verts[i], verts[j]));
				}
			});
		}

		display.Set(verts, edges);
	}

	function Export()
	{
		let matrix = display.GetMatrix();

		matrixString = matrix.map((v, i) => v.reduce<string>((s, c) => s + (c ? "1" : "0"), "")).join("\n");
	}

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

    $: if(selected !== null)
	{
		color = selected.color.ToString().slice(0, 7);
		position = selected.pos;
		radius = selected.radius;
		open = true;
	}
</script>

<aside style:left = {open ? 0 : null} on:mousedown = {e => gridCanvas.OnMouseDown(e)} on:mouseup = {e => gridCanvas.OnMouseUp(e)} 
	on:mousemove = {e => gridCanvas.OnMouseMove(e)} on:contextmenu|preventDefault>
	<div id = "sidebar-toggle" on:click = {() => {open = !open}}></div>
	{#if selected !== null}
		<h2>Vertex {display.IdToName(selected.id)}</h2>
		<div id = "position">
			Position: (<input type = "number" size = 4 min = -15 max = 15 step = 0.1 value = {position.x.toPrecision(5)} bind:this = {xInput} on:change|trusted = {OnPositionChange} />, <input type = "number" size = 4 min = -15 max = 15 step = 0.1 value = {position.y.toPrecision(5)} bind:this = {yInput} on:change|trusted = {OnPositionChange} />)
		</div>
		<div id = "radius">
			Radius: <input type = "number" size = 4 min = 0.12 max = 12 step = 0.05 value = {radius.toPrecision(3)} bind:this = {radiusInput} on:change|trusted = {OnRadiusChange}/>
		</div>
		<div id = "recolor">Color:&nbsp;<input type = "color" bind:this = {colorInput} on:change = {OnColorChange} id = "color-picker" value = {color}/></div>
		<button on:click = {() => {display.DeleteSelected();}} id = "delete-button">Delete <div id = "delete-icon"><FaTrash /></div></button>
	{:else}
		<h2>Graph Options</h2>
		<div id = "scroll-view">
			<Foldup title = "Import & Export" on:toggle = {FoldupToggled} open = {foldups[0]} index = {0}>
				<div id = "importer-flex">
					<h4>Adjacency Matrix:</h4>
					<textarea bind:value = {matrixString} rows = 3 wrap = off on:mousedown|stopPropagation = {() => {}}></textarea>
					<div id = "controls">
						<button on:click = {Import}>Import</button>
						<button on:click = {Export}>Export</button>
					</div>
				</div>
			</Foldup>
			<Foldup title = "Mathematics" on:toggle = {FoldupToggled} open = {foldups[1]} index = {1}>
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
			</Foldup>
			<Foldup title = "Simulation" on:toggle = {FoldupToggled} open = {foldups[2]} index = {2}>
				WIP
			</Foldup>
			<Foldup title = "Snapshots" on:toggle = {FoldupToggled} open = {foldups[3]} index = {3}>
				<div id = "adder">
					<input type = "text" size = 30 placeholder = "Snap name" bind:value = {snapName} />
					<button on:click = {() => display.Save(snapName)}>Save</button>
				</div>
				{#each $snapshots as snap, i (snap.id)}
					<SnapshotDisplay name = {snap.name} index = {i} {display} />
				{/each}
			</Foldup>
		</div>
	{/if}
	<div id = "static-buttons">
		<button on:click = {() => {helpDispatcher("help")}}>Help</button>
		<button on:click = {() => {display.Clear()}}>Clear</button>
	</div>
</aside>

<style>
	aside
	{
		width: 384px;
		height: 550px;
		z-index: 50;
		box-sizing: border-box;

		border-radius: 0 20px 20px 0;
		background-color: #e4e4e49c;
		backdrop-filter: blur(6px);
		box-shadow: #3c3c6d4b 2px 2px 8px;
		position: absolute;
		left: -384px;
		top: 10vh;
		transition: left 0.12s ease-in;

		padding: 10px 12px;
		display: flex;
		gap: 8px;
		flex-direction: column;
		align-items: flex-start;
	}

	#importer-flex
	{
		display: flex;
		flex-direction: column;
		width: 100%;
		align-items: center;
	}

	#importer-flex textarea
	{
		width: 100%;
	}

	#importer-flex h4
	{
		width: 100%;
		text-align: left;
		margin: 0 0 12px 0;
	}

	#importer-flex #controls
	{
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
	}

	#recolor
	{
		display: flex;
	}

	#delete-icon
	{
		width: 24px;
		height: 24px;
		display: inline-block;
		color: red;
		overflow: hidden;
	}

	#static-buttons
	{
		display: flex;
		width: 100%;
		justify-content: center;
		align-items: center;
		position: absolute;
		bottom: 30px;
		gap: 12px;
	}

    #color-picker
	{
		padding: 1px;
	}

	#scroll-view
	{
		width: 100%;
		height: 70%;
		display: flex;
		flex-direction: column;
		gap: 16px;
		overflow-y: auto;
	}

	#sidebar-toggle
	{
		width: 40px;
		height: 40px;
		border-radius: 50%;
		
		position: absolute;
		right: 0;
		bottom: 5vh;
		transform: translate(50%, -50%);
	
		cursor: pointer;
		
		background-color: #7e7e9c;
	}
</style>