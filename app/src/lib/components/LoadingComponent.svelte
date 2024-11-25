<script lang="ts">
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';

    // the messages that are displayed in the loading component
    const LOADING_MESSAGES = [
        "Analyzing document",
        "Extracting clauses",
        "Understanding Indemnification clauses",
        "Looking for Termination clauses", 
        "Searching for Liability clauses",
        "Gathering context",
        "Summarizing clauses"
    ];

    // the animation settings for the loading component
    const ANIMATION_SETTINGS = {
        timeOnScreen: 2000,
        transitionTime: 200,
        dotUpdateInterval: 550,
        fly: { y: 20, duration: 300 },
        fade: { duration: 200 }
    };

    let currentIndex = 0;
    let visible = true;
    let dots = "";

    // updates the dots to animate ., .., or ...
    const updateDots = () => {
        dots = dots.length < 3 ? dots + "." : "";
    };

    const updateMessage = () => {
        visible = false;
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
            dots = "";
            visible = true;
        }, ANIMATION_SETTINGS.transitionTime);
    };

    onMount(() => {
        const dotInterval = setInterval(updateDots, ANIMATION_SETTINGS.dotUpdateInterval);
        const messageInterval = setInterval(updateMessage, ANIMATION_SETTINGS.timeOnScreen);

        return () => {
            clearInterval(messageInterval);
            clearInterval(dotInterval);
        };
    });
</script>

<div class="flex justify-center items-center min-h-[60px]">
    {#if visible}
        <p 
            class="font-bold text-xl animate-bounce"
            in:fly={ANIMATION_SETTINGS.fly}
            out:fade={ANIMATION_SETTINGS.fade}
        >
            {LOADING_MESSAGES[currentIndex]}<span>{dots}</span>
        </p>
    {/if}
</div>
