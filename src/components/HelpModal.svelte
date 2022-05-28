<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { fly } from 'svelte/transition';

    import FaTimes from 'svelte-icons/fa/FaTimes.svelte';

    const dispatcher = createEventDispatcher();
</script>

<div transition:fly>
    <header>
        <h2>Help</h2>
        <div id = "close" on:click = {() => {dispatcher('close')}}>
            <FaTimes />
        </div>
    </header>
    <section>
        <h3>Navigation</h3>
        <p>To move around the grid, drag while holding the <em>middle mouse button</em>. The <em>scroll wheel</em> can be used to zoom in and out.</p>
    </section>
    <section>
        <h3>Making Graphs</h3>
        <p>Use the <em>left mouse button</em> to draw on the grid.<br>In order to add a vertex to the graph, draw a circle on the canvas. To add an edge, draw a line between any two existing vertices.<br>To remove an edge connecting two vertices, draw another line between them.<br>Finally, a vertex can be selected using the <em>right mouse button</em>, allowing you to edit its properties.</p>
    </section>
</div>

<style>
    div:not(#close)
    {
        overflow-y: auto;
        position: absolute;
        padding: 25px;
        left: 50%;
        top: 10vh;
        transform: translate(-50%);
        border-radius: 20px;
        width: 20vw;
        height: 50vh;
        background-color: white;
        z-index: 500;

        box-shadow: #4533537e 1px 1px 12px;
    }

    em
    {
        font-weight: 600;
        font-style: normal;
        text-decoration: underline;
    }

    header
    {
        position: fixed;
        display: flex;
        width: 85%;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }

    #close
    {
        width: 30px;
        height: 30px;
        cursor: pointer;
    }

    section
    {
        position: relative;
        top: 55px;
    }
</style>