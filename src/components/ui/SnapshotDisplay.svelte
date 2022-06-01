<script lang="ts">
    import DisplayCanvas from "../DisplayCanvas.svelte";
    import { snapshots } from "../../stores/snapshot";

    export let name : string;
    export let index : number;
    export let display : DisplayCanvas;

    function Delete()
    {
        snapshots.remove(index);
    }

    function Load()
    {
        display.Load($snapshots[index]);
    }
</script>

<div class = "card">
    <h4>{name}</h4>
    <div class = "actions">
        <button on:click = {Load}>Load</button>
        <button on:click = {Delete}>Delete</button>
    </div>
</div>

<style>
    .card
    {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-content: center;
        justify-content: space-between;
    }

    .actions
    {
        display: flex;
        position: relative;
        top: 5px;
        gap: 4px;
        flex-direction: row;
    }

    button
    {
        padding: 4px 8px;
		border-radius: 6px;
		border: none;
		align-self: center;

		font-size: medium;

		display: flex;
		flex-direction: row;
		gap: 8px;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		transition-duration: 0.1s;
    }
</style>