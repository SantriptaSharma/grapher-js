<script lang="ts">
	import DisplayCanvas from "./components/DisplayCanvas.svelte";
	import GridCanvas from "./components/GridCanvas.svelte";
	import HelpModal from "./components/HelpModal.svelte";
	import Sidebar from "./components/Sidebar.svelte";
	import { GraphVertex } from "./library/graphelement";

	let helpModalOpen = false;
	let gridCanvas : GridCanvas;
	let display : DisplayCanvas;
	let sidebar : Sidebar;
	let selected : GraphVertex = null;
</script>

{#if helpModalOpen}
<HelpModal on:close = {() => {helpModalOpen = false}} />
{/if}
<Sidebar bind:this = {sidebar} {gridCanvas} {display} {selected} on:help = {() => helpModalOpen = !helpModalOpen} />
<main>
	<GridCanvas bind:this = {gridCanvas} />
	<DisplayCanvas bind:this = {display} bind:selectedVert = {selected} on:changed = {() => sidebar.InvalidateColoring(false)} on:cleared = {() => sidebar.InvalidateColoring(true)} />
</main>

<style>
	:global(body)
	{
		padding: 0;
		overflow: hidden;
		background-color: #e0e0e0;
	}
	
	main
	{
		width: 100vw;
		height: 100vh;
	}

</style>