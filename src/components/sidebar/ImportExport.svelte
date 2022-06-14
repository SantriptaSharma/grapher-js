<script lang="ts">
    import DisplayCanvas from "../DisplayCanvas.svelte";
    
    import { GraphEdge, GraphVertex } from "../../library/graphelement";
    import { ImportPlacer } from "../../library/helpers";

    export let display : DisplayCanvas;
    let matrixString : string = "";

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
</script>

<div id = "importer-flex">
    <h4>Adjacency Matrix:</h4>
    <textarea bind:value = {matrixString} rows = 3 wrap = off on:mousedown|stopPropagation = {() => {}}></textarea>
    <div id = "controls">
        <button on:click = {Import}>Import</button>
        <button on:click = {Export}>Export</button>
    </div>
</div>

<style>
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
</style>